var fs = require('fs'),
    _ = require('underscore');

var handle = function(req, options) {
  var capture = 1,
      downloaded = [],
      content,
      responded = false;

  // casper setup

  var casper = require('casper').create({
        clientScripts: [
          'lib/jquery.js',    // These two scripts will be injected in remote
          'lib/underscore.js' // DOM on every req
        ],
    //    verbose: true,
        logLevel: 'info',              // Only "info" level messages will be logged
        onError: function (self, m) {  // Any "error" level message will be written
          console.log('FATAL:' + m);   // on the console output and PhantomJS will
          options.error({message:m});  // terminate
          responded = true;
        },
        pageSettings: {
          userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.10 (KHTML, like Gecko) Chrome/23.0.1268.0 Safari/537.10',
          loadImages: true,            // The WebPage instance used by Casper will
          loadPlugins: false           // use these settings
        }
      });

  casper.on('step.complete', function () {
    this.capture('capture/' + capture++ + '.png');
  });

  casper.on('page.error', function (msg, trace) {
    this.echo("Warning: " + msg, "warning");
  });

  casper.on('downloaded.file', function(targetPath) {
    downloaded.push(targetPath);
  });

  // casper steps
  casper.start('http://pastie.org/3244563', function () {
    this.download('http://pastie.org/pastes/3244563/download', 'app/download/3244563.txt');
  });

  casper.then(function () {
    this.test.assertEquals(['app/download/3244563.txt'], downloaded, 'downloaded 1 file');
  });

  casper.then(function() {
    var stream = fs.open('app/download/3244563.txt', 'r');
    content = stream.read();
    stream.close();
  });

  casper.then(function () {
    this.test.assert(content.length > 0, 'download has non blank content');
  });

  casper.run(function() {
    if (responded) return;
    var failures = this.test.getFailures();
    if (failures.length == 0) {
      var result = _.extend({}, req, {content: content});
      options.success(result);
    } else {
      options.error({message:"one or more assertions failed", failures: failures});
    }
  });
};

exports.handle = handle;