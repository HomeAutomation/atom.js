var _ = require('underscore');

var util = require('../../unit-util');

exports.unit = util.createUnit(function($) {
  // rfTransceive setup
  this.$rfTransceive = $({ type: 'RfTransceive',
                           moduleId: this.metadata.get('rfTransceiveModuleId') });
  // button and channel order
  this.bitOrder = [3, 1, 2, 0];

  // dimmer level values
  this.dimLevels = [ 15, 7, 11, 3, 13, 5, 9, 1, 14, 6, 10, 2, 12, 4, 8, 0];

  this.encodeButtonId = function(buttonNumber, isOn, groupMode, channelNumber) {
    return 0x001 * buttonNumber +
           0x100 * (isOn ? 1 : 0) +
           0x200 * (groupMode ? 1 : 0) +
           0x010 * channelNumber;
  };

  this.decodeButtonId = function(buttonValue) {
    // 0x000F is buttonNumber
    var buttonNumber = buttonValue & 0x00F;
    // 0x00F0 is channel number
    var channelNumber = buttonValue & 0x0F0;
    // 0x0100 is on/off state, inverted bit
    var state = !!(buttonValue & 0x100);
    // 0x0200 is groupMode, inverted bit
    var groupMode = !!(buttonValue & 0x200);

    return {
      buttonNumber: buttonNumber,
      state: state,
      groupMode: groupMode,
      channelNumber: channelNumber
    };
  };

  this.encodeButtonData = function(button) {
    var buttonVal = this.bitOrder.indexOf(button.buttonNumber);
    var channelVal = this.bitOrder.indexOf(button.channelValue);
    var state = button.state ? 0 : 1;
    var groupMode = button.groupMode ? 0 : 1;

    var data = this.metadata.get('houseId') |
          (buttonVal << 30) |
          (channelVal << 28) |
          (state << 27) |
          (groupMode << 26);
    data = data >>> 0;
    return data;
  };

  this.implement('buttonInput', ['button'], function() {
    this.$rfTransceive.on('data', function(unit, event) {
      if (event.protocol !== 'Nexa2' ||
          (event.data & 0x3FFFFFF) !== this.metadata.get('houseId')) { // 26 bit id
          return;
      }
      event = _.clone(event);
      var buttonNumber = this.bitOrder[(event.data >> 30) & 0x3];
      var channelNumber = this.bitOrder[(event.data >> 28) & 0x3];
      var isOn = ((event.data >> 27) & 0x1) === 0 ? true : false;
      var groupMode = ((event.data >> 26) & 0x1) === 0 ? true : false;

      event.buttonId = this.encodeButtonId(buttonNumber, isOn, groupMode, channelNumber);
      this.emit('button', event);
    }.bind(this));
  });
  
  this.implement('buttonOutput', function() {
    this.sendButton = function(buttonId) {
      var button = this.decodeButtonId(buttonId);
      var data = this.encodeButtonData(button);
      this.$rfTransceive.send('burst', 'Nexa2', data);
    };
  });

  this.implement('dimmerGroup', function() {
    this.sendAbsoluteDim = function(id, value) {
      var button = this.decodeButtonId(id);

      // if dimming to zero, use send button off instead
      if (value === 0) {
        button.isOn = false; // this value doesn't matter for dimming
        this.sendButton(this.encodeButtonId(button));
      }
      
      var level = Math.ceil(value * 16); // value is [0, 1]
      var data = this.encodeButtonData(button);

      console.log('data', data.toString(2));

      // Add dimmer bits on top
      data = data + 0x8000000000;
      data = data + 0x0100000000 * this.dimLevels[level - 1];
      
      this.$rfTransceive.send('burst', 'Nexa2', data);
    };
  });
});
