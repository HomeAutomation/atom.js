var _ = require('underscore');

var util = require('../unit-util');

exports.unit = util.createUnit(function($) {
  this.$rfTransceive = $(this.metadata.get('rfTransceiveSelector'));

  this.channelIdMask = 0x3000000;
  this.negativeBitMask = 0x800000;
  
  this.implement('temperature', ['temperature'], function() {
    this.$rfTransceive.on('data', function(unit, event) {
      if (event.protocol !== 'Rubicson' ||
          (event.data & this.channelIdMask) !== (this.metadata.get('channelId') & this.channelIdMask)) { 
          return;
      }

      var channel = (event.data >> 24) & 0x3;
      var temperature;
      if (event.data & this.negativeBitMask) {
        temperature = - (0x1FF - ((event.data >> 12) & 0x1FF)) / 10;
      } else {
        temperature = ((event.data >> 12) & 0x1FF) / 10;
      }
      var humidity = (event.data & 0xFF);
      
      this.emit('temperature', {
        originalEvent: event,
        temperature: temperature,
        humidity: humidity,
        channel: channel
      });
    }.bind(this));
  });
});
