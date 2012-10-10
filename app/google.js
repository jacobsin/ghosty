phantom.casperPath = 'casperjs';
phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js');

var capture = 1;

// casper setup

var utils = require('utils'),
  casper = require('casper').create({
    clientScripts: [
      'lib/jquery.js', // These two scripts will be injected in remote
      'lib/underscore.js'   // DOM on every request
    ],
//    verbose: true,
    logLevel: 'info', // Only "info" level messages will be logged
    onError: function (self, m) { // Any "error" level message will be written
      console.log('FATAL:' + m); // on the console output and PhantomJS will
      self.exit();               // terminate
    },
    pageSettings: {
      userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.10 (KHTML, like Gecko) Chrome/23.0.1268.0 Safari/537.10',
      loadImages: true, // The WebPage instance used by Casper will
      loadPlugins: false // use these settings
    }
  });

casper.on('step.complete', function () {
  this.capture('capture/' + capture++ + '.png');
});

casper.on('page.error', function (msg, trace) {
  this.echo("Error: " + msg, "error");
});

// casper steps

casper.start('http://www.google.com.hk', function () {
  this.fill('form[action="/search"]', {
    q: 'hong kong weather'
  }, true);
});

casper.then(function () {
  this.test.assertExists('li.g.tpo table', "google weather widget table exists");
  this.test.assertEvalEquals(function () {
    return $('li.g.tpo table tr').length;
  }, 6, "google weather widget should have 6 rows")
});

casper.thenEvaluate(function () {
  var rows = $('li.g.tpo table tr');
  _(rows).each(function (row) {
    var rowText = _($(row).children('td')).inject(function (memo, cell) {
      var $cell = $(cell);
      memo.push($cell.text() || $cell.children('img').attr('title'));
      return memo;
    }, []);
    console.log(rowText.join(" "));
  });
});

casper.run(function () {
  this.exit();
});
