var util = require('../interface-util');

exports.unitInterface = util.createInterface(function() {
  this.event('temperature', function() {
    throw new Error('Must be overrriden');
  });
});