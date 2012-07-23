casper = require('casper').create()


casper.start 'http://www.google.com', ->
  @test.assertTitle "Google", "google homepage title is the one expected"
  @test.assertExists 'form[action="/search"]', "main form is found"
  @fill 'form[action="/search"]', q: "foo", true

casper.then ->
  @test.assertTitle "foo - Google 搜尋", "google title is ok"
  @test.assertUrlMatch /q=foo/, "search term has been submitted"
  @test.assertEval (->
    __utils__.findAll("h3.r").length >= 10
  ), "google search for \"foo\" retrieves 10 or more results"


casper.run ->
  @capture 'images/casper.png'
  @test.renderResults true