var _ = require('underscore');

var util = require('../interface-util');

exports.unitInterface = util.createInterface(function($) {
  this.setUp = function() {
    this.rfTransceive = $({ type: 'RfTransceive', moduleId: this.metadata.get('rfTransceiveModuleId') });
    this.bitOrder = [3, 1, 2, 0];
    this.dimLevels = [ 0, 15, 7, 11, 3, 13, 5, 9, 1, 14, 6, 10, 2, 12, 4, 8, 0 ];
  };
  
  this.event('button', function() {
    this.rfTransceive.on('data', function(unit, event) {
      if (event.protocol !== 'Nexa2' ||
         (event.data & 0x3FFFFFF) !== this.metadata.get('houseId')) { // 26 bit id
        return;
      }
      event = _.clone(event);
      event.buttonNumber = this.bitOrder[(event.data >> 30) & 0x3];
      event.channelNumber = this.bitOrder[(event.data >> 28) & 0x3];
      event.status = ((event.data >> 27) & 0x1) === 0 ? true : false;
      event.groupMode = ((event.data >> 26) & 0x1) === 0 ? true : false;
      event.on = event.status;
      event.off = !event.on;
      this.emit('button', event);
    }.bind(this));
  });

  this.sendButton = function(state, buttonNumber, channelNumber, groupMode) {
    if (arguments.length < 3) {
      channelNumber = 0;
    }
    if (arguments.length < 4) {
      groupMode = false;
    }
    
    groupMode = groupMode ? 0 : 1;
    state = state ? 0 : 1;
    var buttonValue = this.bitOrder.indexOf(buttonNumber);
    var channelValue = this.bitOrder.indexOf(channelNumber);
    
    var data = this.metadata.get('houseId') |
          (buttonValue << 30) |
          (channelValue << 28) |
          (state << 27) |
          (groupMode << 26);
    data = data >>> 0;
    this.rfTransceive.forEach(function() {
      this.sendBurst('Nexa2', data);
    });
  };

  this.sendButtonOn = function(buttonNumber, channelNumber, groupMode) {
    this.sendButton(true, buttonNumber, channelNumber, groupMode);
  };

  this.sendButtonOff = function(buttonNumber, channelNumber, groupMode) {
    this.sendButton(false, buttonNumber, channelNumber, groupMode);
  };

  this.sendDimLevel = function(dimLevel, buttonNumber, channelNumber, groupMode) {
    if (arguments.length < 3) {
      channelNumber = 0;
    }
    if (arguments.length < 4) {
      groupMode = false;
    }
    
    groupMode = groupMode ? 0 : 1;
    dimLevel = this.dimLevels[dimLevel];
    var buttonValue = this.bitOrder.indexOf(buttonNumber);
    var channelValue = this.bitOrder.indexOf(channelNumber);
    
    var data = this.metadata.get('houseId') +
          (buttonValue << 30) +
          (channelValue << 28) +
          (0 << 27) +
          (groupMode << 26);
    data = data >>> 0;
    data = data + dimLevel * 0x100000000; // dimmer value
    data = data + 0x8000000000; // dimmer flag
    
    this.rfTransceive.forEach(function() {
      this.sendBurst('Nexa2', data);
    });
  };
});