var _ = require('underscore');

var util = require('../unit-util');

exports.unit = util.createUnit(function($) {
  this.$rfTransceive = $(this.metadata.get('rfTransceiveSelector'));

  var offIdMask = 0x1F; // Last 5 bits
  
  this.implement('buttonInput', ['button'], function() {
    this.$rfTransceive.on('data', function(unit, event) {
      // offId is the ID of any button on the remote
      // masked to get the house ID
      if (event.protocol !== 'Nexa' ||
          (event.data & offIdMask) !== (this.metadata.get('offId') & offIdMask)) {
        return;
      }

      var buttonNumber = Math.log((event.data >> 5) & 0x0F) / Math.log(2);
      var isOn = (event.data >> 11 === 0); // last bit not set indicates on

      var buttonEvent = {
        originalEvent: event,
        buttonNumber: buttonNumber,
        isOn: isOn
      };
      
      this.emit('button', buttonEvent);
    }.bind(this));
  });
});
