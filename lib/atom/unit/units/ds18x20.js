var util = require('../unit-util');

exports.unit = util.createUnit(function() {
  this.implement('sensorControl');
  this.implement('temperature', ['temperature'], function() {
    this.on('message', function(message) {
      this.emit('temperature', {
        temperature: message.body.Value,
        sensorId: message.body.SensorId,
        originalEvent: message
      });
    }.bind(this));
  });
});
