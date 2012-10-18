var util = require('../interface-util');

exports.unitInterface = util.createInterface(function() {
  this.event('humidity', function() {
    throw new Error('Must be overrriden');
  });
});