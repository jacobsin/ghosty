// Google for hong kong weather

var page = require('webpage').create(),
  url = 'http://www.google.com.hk';

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

page.open(url, function (status) {
  if (status !== 'success') {
    console.log('Unable to access network');
  } else {
    // jQuery is loaded, now manipulate the DOM
    page.evaluate(function () {
      var q = document.querySelector('input[name=q]');
      q.focus();
      q.value = 'hong kong weather';
    });
    page.render("images/step.png");
  }
  phantom.exit();
});
