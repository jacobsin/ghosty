system = require('system')
page = require('webpage').create()

if system.args.length < 3
  console.log 'Usage: bellagio.coffee <username> <password> [date] [time]'
  phantom.exit 1

username = system.args[1]
password = system.args[2]
targetDate = system.args[3]
targetTime = system.args[4] ? 18

testindex = 0
loadInProgress = false
renderStep = true
config =
  badminton :
    fac : 3
  bbq :
    fac : 14

script = {}

sortBy = (key, a, b, r) ->
  r = if r then 1 else -1
  return -1*r if a[key] > b[key]
  return 1*r if a[key] < b[key]
  return 0

page.viewportSize = width: 1240, height: 768
page.settings.loadImages = false
#page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/537.2 (KHTML, like Gecko) Chrome/22.0.1213.0 Safari/537.2'

page.onConsoleMessage = (msg) -> console.log(msg)

page.onLoadStarted = ->
  loadInProgress = true
#  console.log 'load started'

page.onLoadFinished = (status)->
  loadInProgress = false
  if status isnt 'success'
    console.log 'FAIL to load the address'
    phantom.exit 1
  else
    console.log page.evaluate(->document.title)
#    console.log 'load finished'

page.onResourceRequested = (request)->
#  console.log "Request #{request.id} #{request.url} #{request.method}"

page.onResourceReceived = (response)->
#  console.log "Receive #{response.id} #{response.url} #{response.status} #{response.stage}"

page.onUrlChanged = -> console.log(arguments[0])

includes = (onIncluded)->
  loadInProgress = true
  page.includeJs 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', ()->
    loadInProgress = false
    onIncluded()

steps=[
  ->
    page.open "http://113.28.45.75/Portal/"
  ,
  ->
    includes(->
      page.evaluate((username, password)->
        $('#txtUserID').val username
        $('#txtPassword').val password
        $('#cmdLogin').click()
      , username, password)
    loadInProgress = true
    )
  ,
  ->
    page.open "http://113.28.45.75/Portal/module.aspx?name=booking&file=book&selfac=#{config.badminton.fac}"
  ,
  ->
    includes(->
      script.freeslots = JSON.parse(page.evaluate((targetDate, targetTime)->
        times = ($(slot).text() for slot in $('table.content tr td:first-child'))
        dates = ($(date).text() for date in $('table.content tr:first-child td'))

        distance = (time)->
          start = parseInt(time.substring(0, 2), 10)
          Math.abs(targetTime - start)

        freeslots = (for checkbox in $('table.content :checkbox')
          row = $(checkbox).closest('tr')[0].rowIndex
          id = $(checkbox).attr('id')
          col = parseInt(id.charAt(id.length-1), 10)+1
          col: col, row: row, id: id, date: dates[col], time: times[row], distance: distance(times[row])
        )

        sortBy = (key, a, b, r) ->
          r = if r then 1 else -1
          return -1*r if a[key] > b[key]
          return 1*r if a[key] < b[key]
          return 0

        freeslots.sort (a,b) ->
          sortBy('col', a, b) or
          sortBy('row', a, b)

        freeslots = freeslots.filter (s) -> s.date.indexOf(targetDate) > -1 if targetDate?

        console.log $('#Module1__ctl4_lblBookPeriod').text()
        console.log "Available slots: #{freeslots.length}"
        console.log ("##{i} #{slot.date} #{slot.time}" for slot, i in freeslots).join '\n'

        JSON.stringify(freeslots)
      , targetDate, targetTime))
    )
  ,
  ->
    script.freeslots.sort (a,b) ->
      sortBy('distance', a, b)

    target = script.freeslots[0]
    phantom.exit(1) unless target?
    console.log "targeting #{target.date} #{target.time}"
    page.evaluate((target)->
      $("##{target}").attr('checked', true)
      $('#Module1__ctl4_cmdConfirm').click()
    , target.id)
    loadInProgress = true
  ,
  ->
    includes(()->
      page.evaluate ()->
        document.getElementById('Module1__ctl4_cmdAccept').click()
    )
    loadInProgress = true
  ,
  ->
    console.log 'end'
]

interval = setInterval(->
#  console.log loadInProgress
  if (!loadInProgress && typeof steps[testindex] == "function")
    console.log "step #{(testindex + 1)}"
    steps[testindex]()
    page.render("images/step#{(testindex + 1)}.png") if renderStep
    testindex++
  if (typeof steps[testindex] != "function")
    phantom.exit()
, 50)