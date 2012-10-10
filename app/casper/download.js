var _ = require('underscore'),
    fs = require('fs');

require('super');

var CasperSteps = Class.extend({
  init: function (options) {
    this.casper = options.casper;
    this.req = options.req;
  }
});

var DownloadSteps = CasperSteps.extend({
  init: function (options) {
    this._super(options);
    this.downloaded = [];
  },

  specify: function () {
    var steps = this;
    this.casper.on('downloaded.file', function(targetPath) {
      steps.downloaded.push(targetPath);
    });

    this.casper.start('http://pastie.org/3244563', function () {
      this.download('http://pastie.org/pastes/3244563/download', 'app/download/3244563.txt');
    });

    this.casper.then(function () {
      this.test.assertEquals(['app/download/3244563.txt'], steps.downloaded, 'downloaded 1 file');
    });

    this.casper.then(function () {
      var stream = fs.open('app/download/3244563.txt', 'r');
      steps.content = stream.read();
      stream.close();
    });

    this.casper.then(function () {
      this.test.assert(steps.content.length > 0, 'download has non blank content');
    });
  },

  result: function () {
    return _.extend({}, this.req, {content: this.content});
  }
});

exports.create = function(casper, req) {
  return new DownloadSteps({
    casper: casper,
    req: req
  });
};