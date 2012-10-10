var handle = function(req, options) {
  var capture = 1,
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

  // casper steps
  var steps = require('./app/casper/download').create(casper, req);
  steps.specify();

  casper.run(function() {
    if (responded) return;
    var failures = this.test.getFailures();
    if (failures.length == 0) {
      var result = steps.result();
      options.success(result);
    } else {
      options.error({message:"one or more assertions failed", failures: failures});
    }
  });
};

exports.handle = handle;