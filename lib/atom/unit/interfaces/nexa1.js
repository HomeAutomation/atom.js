var _ = require('underscore');

var util = require('../interface-util');

exports.unitInterface = util.createInterface(function($) {
  this.setUp = function() {
    this.rfTransceive = $({ type: 'RfTransceive', moduleId: this.metadata.get('rfTransceiveModuleId') });
  };
  
  this.event('button', function() {
    this.rfTransceive.on('data', function(unit, event) {
      if (event.protocol !== 'Nexa' ||
          !(event.data & this.metadata.get('houseId'))) {
        return;
      }
      event = _.clone(event);
      event.on = (event.data >> 11 === 0); // last bit not set indicates on
      event.off = !event.on;
      event.buttonNumber = Math.log((event.data >> 5) & 0x0F) / Math.log(2);
      this.emit('button', event);
    }.bind(this));
  });

  this.sendButton = function(state, buttonNumber) {
    state = state ? 0 : 1;
    var data = this.metadata.get('houseId') |
          (1 << (8 - buttonNumber)) |
          (state << 11) |
          (Math.abs(state - 1) << 10);

    this.rfTransceive.forEach(function() {
      this.sendBurst('Nexa', data);
    });
  };

  this.sendButtonOn = function(buttonNumber) {
    this.sendButton(true, buttonNumber);
  };

  this.sendButtonOff = function(buttonNumber) {
    this.sendButton(false, buttonNumber);
  };
});