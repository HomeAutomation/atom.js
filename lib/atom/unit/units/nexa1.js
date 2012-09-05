var _ = require('underscore');

var util = require('../unit-util');

exports.unit = util.createUnit(function($) {
  // rfTransceive setup
  this.$rfTransceive = $({ type: 'RfTransceive',
                           moduleId: this.metadata.get('rfTransceiveModuleId') });

  this.encodeButtonData = function(buttonNumber, isOn) {
    return 0x001 * buttonNumber +
           0x100 * isOn;
  };

  this.decodeButtonData = function(buttonValue) {
    // 0x00F are button number
    var buttonNumber = buttonValue & 0x00F;
    // 0x100 is on/off state
    var state = !!(buttonValue & 0x100);

    return {
      buttonNumber: buttonNumber,
      state: state
    };
  };
  
  this.implement('buttonInput', ['button'], function() {
    this.$rfTransceive.on('data', function(unit, event) {
      if (event.protocol !== 'Nexa' ||
          !(event.data & this.metadata.get('houseId'))) {
        return;
      }
      event = _.clone(event);

      var buttonNumber = Math.log((event.data >> 5) & 0x0F) / Math.log(2);
      var isOn = (event.data >> 11 === 0); // last bit not set indicates on
      event.buttonId = this.encodeButtonData(buttonNumber, isOn);

      this.emit('button', event);
    }.bind(this));
  });
  
  this.implement('buttonOutput', function() {
    this.sendButton = function(buttonId) {
      var button = this.decodeButtonData(buttonId);

      var buttonVal = button.buttonNumber;
      var state = button.state ? 0 : 1;
      
      var data = this.metadata.get('houseId') |
            (1 << (8 - buttonVal)) |
            (state << 11) |
            (Math.abs(state - 1) << 10);

      this.$rfTransceive.send('burst', 'Nexa', data);
    };
  });
});
