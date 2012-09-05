var _ = require('underscore');

var util = require('../interface-util');

exports.unitInterface = util.createInterface(function($) {
  this.event('button', function() {
    throw new Error('Must be overriden');
  });
});