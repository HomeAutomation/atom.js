var _ = require('underscore');

var util = require('../interface-util');

exports.unitInterface = util.createInterface(function($) {
  this.sendAbsoluteDim = function() {
    throw new Error('Must override sendAbsoluteDim');
  };
});