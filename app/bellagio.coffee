system = require('system')
page = require('webpage').create()

if system.args.length < 3
  console.log 'Usage: bellagio.coffee <username> <password>'
  phantom.exit 1

username = system.args[1]
password = system.args[2]

page.viewportSize =
  width: 1240
  height: 768

page.onConsoleMessage = (msg) -> console.log(msg)

page.onUrlChanged = () -> console.log(arguments[0])

page.open 'http://113.28.45.75/Portal/', (status) ->
  if status isnt 'success'
    console.log 'FAIL to load the address'
  else
    console.log page.evaluate(()->document.title)
    page.includeJs 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', ()->
      page.evaluate (username, password)->
        console.log "jquery #{$.fn.jquery} loaded"
        $('#txtUserID').val username
        $('#txtPassword').val password
        $('#cmdLogin').click
      page.on
#      page.sendEvent 'click'
      page.open 'http://113.28.45.75/Portal/Default.aspx', (status) ->
        if status isnt 'success'
          console.log 'FAIL to load the address'
        else
          console.log page.evaluate(()->document.title)
          page.render('screen.png')
          phantom.exit()
