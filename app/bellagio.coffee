system = require('system')
page = require('webpage').create()

if system.args.length < 3
  console.log 'Usage: bellagio.coffee <username> <password>'
  phantom.exit 1

username = system.args[1]
password = system.args[2]
testindex = 0
loadInProgress = false
renderStep = true

page.viewportSize =
  width: 1240
  height: 768

page.onConsoleMessage = (msg) -> console.log(msg)

page.onLoadStarted = ()->
  loadInProgress = true
  console.log 'load started'

page.onLoadFinished = (status)->
  loadInProgress = false
  if status isnt 'success'
    console.log 'FAIL to load the address'
    phantom.exit 1
  else
    page.evaluate(()->document.title)
    console.log 'load finished'

page.onResourceRequested = (request)->
#  console.log "Request #{request.id} #{request.url} #{request.method}"

page.onResourceReceived = (response)->
#  console.log "Receive #{response.id} #{response.url} #{response.status} #{response.stage}"

page.onUrlChanged = () -> console.log(arguments[0])

steps=[
  ()->
    page.open 'http://113.28.45.75/Portal/'
  ,
  ()->
    loadInProgress = true
    page.includeJs 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', ()->
      loadInProgress = false
      page.evaluate((username, password)->
        console.log "jquery #{$.fn.jquery} loaded"
        console.log "#{username}, #{password}"
        $('#txtUserID').val username
        $('#txtPassword').val password
        $('#cmdLogin').click()
      , username, password)
  ,
  ()->
    console.log 'moo'
]

interval = setInterval(()->
  if (!loadInProgress && typeof steps[testindex] == "function")
    console.log "step #{(testindex + 1)}"
    steps[testindex]()
    page.render("images/step#{(testindex + 1)}.png") if renderStep
    testindex++
  if (typeof steps[testindex] != "function")
    console.log 'test complete!'
    phantom.exit()
, 50)