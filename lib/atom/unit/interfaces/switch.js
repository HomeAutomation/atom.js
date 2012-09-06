var _ = require('underscore');

var util = require('../interface-util');

exports.unitInterface = util.createInterface(function($) {
  this.sendOn = function() {
    this.sendState(true);
  };

  this.sendOff = function() {
    this.sendState(false);
  };

  this.sendState = function() {
    throw new Error('Must be overriden');
  };
});