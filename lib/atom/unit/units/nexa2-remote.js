var _ = require('underscore');

var util = require('../unit-util');

exports.unit = util.createUnit(function($) {
  this.$rfTransceive = $(this.metadata.get('rfTransceiveSelector'));

  this.offIdMask = 0x3FFFFFF;
  // button and channel order
  this.bitOrder = [3, 1, 2, 0];

  
  this.implement('buttonInput', ['button'], function() {
    this.$rfTransceive.on('data', function(unit, event) {
      if (event.protocol !== 'Nexa2' ||
          (event.data & this.offIdMask) !== (this.metadata.get('offId') & this.offIdMask)) { // 26 bit id
          return;
      }

      var buttonEvent = {
        buttonNumber: this.bitOrder[(event.data >> 30) & 0x3],
        channelNumber: this.bitOrder[(event.data >> 28) & 0x3],
        isOn: ((event.data >> 27) & 0x1) === 0 ? true : false,
        groupMode: ((event.data >> 26) & 0x1) === 0 ? true : false,
        originalEvent: event
      };
      
      this.emit('button', buttonEvent);
    }.bind(this));
  });
});
