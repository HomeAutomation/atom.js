var _ = require('underscore');

var util = require('../interface-util');

exports.unitInterface = util.createInterface(function($) {
  this.sendButton = function() {
    throw new Error('Must override sendButton');
  };
});