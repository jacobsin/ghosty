phantom.casperPath = 'casperjs';
phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js');

var capture = 1;

// casper setup

var utils = require('utils'),
  casper = require('casper').create({
    clientScripts: [
      'includes/jquery.min.js', // These two scripts will be injected in remote
      'includes/underscore.min.js'   // DOM on every request
    ],
//    verbose: true,
    logLevel: 'info', // Only "info" level messages will be logged
    onError: function (self, m) { // Any "error" level message will be written
      console.log('FATAL:' + m); // on the console output and PhantomJS will
      self.exit(1);               // terminate
    },
    pageSettings: {
      userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.10 (KHTML, like Gecko) Chrome/23.0.1268.0 Safari/537.10',
      loadImages: true, // The WebPage instance used by Casper will
      loadPlugins: false // use these settings
    }
  });

casper.on('step.complete', function () {
  this.capture('images/' + capture++ + '.png');
});

casper.on('page.error', function (msg, trace) {
  this.echo("Error: " + msg, "error");
});

// casper steps

casper.start('http://cgi-lib.berkeley.edu/ex/fup.html', function () {
  this.fill('form[action^=fup]', {
    upfile: 'app/files/test.txt'
  }, true);
});

casper.then(function () {
  this.test.assertTitle('File Upload Results');
  this.test.assertSelectorHasText('pre', 'testing fileupload');
});


casper.run(function () {
  this.exit();
});