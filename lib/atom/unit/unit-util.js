var baseUnit = require('./base-unit');

exports.createUnit = function(callback) {
  return function(config, canIO, selector) {
    var unit = new baseUnit.BaseUnit(config, canIO, callback, selector);
    return unit;
  };
};

