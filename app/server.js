phantom.casperPath = 'casperjs';
phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js');

phantom.onError = function (msg, trace) {
  console.log(new Date(), msg);
  trace.forEach(function (item) {
    console.log('  ', item.file, ':', item.line, item.function ? 'in ' + item.function : "");
  });
  phantom.exit(1);
};

// Example using HTTP POST operation

var page = require('webpage').create(),
  server = require('webserver').create(),
  system = require('system'),
  handler = require('./app/handler');

if (system.args.length !== 2) {
  console.log('Usage: server.js <portnumber>');
  phantom.exit(1);
}

var port = system.args[1];

var respond = function (req, res, statusCode, body) {
    res.headers = {
      'Cache': 'no-cache',
      'Content-Type': 'text/plain;charset=utf-8'
    };
    res.statusCode = statusCode;
    var entity = JSON.stringify(body, null, 2);
    res.write(entity);
    console.log(new Date(), 'Response: ' + req.method, req.url, statusCode, body ? entity : "");
    res.close();
  },
  success = function (req, res, result) {
    respond(req, res, 200, result);
  },
  error = function (req, res, e) {
    respond(req, res, 500, e.message ? e : {message: e});
  };

service = server.listen(port, function (req, res) {
  try {
    console.log(new Date(), 'Request: ', req.method, req.url, req.post ? req.post : "");
    handler.handle(JSON.parse(req.post), {
      success: function(result) {
        success(req, res, result);
      },
      error: function(e) {
        error(req, res, e);
      }
    });
  } catch (e) {
    error(req, res, e.message ? e : {message: e});
  }
});