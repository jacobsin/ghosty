require('super');

var CasperSteps = Class.extend({
  init: function (options) {
    this.casper = options.casper;
    this.req = options.req;
  }
});

module.exports = CasperSteps;