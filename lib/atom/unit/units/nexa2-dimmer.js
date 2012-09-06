var _ = require('underscore');

var util = require('../unit-util');

exports.unit = util.createUnit(function($) {
  // rfTransceive setup
  this.$rfTransceive = $(this.metadata.get('rfTransceiveSelector'));

  // dimmer level values
  this.dimLevels = [ 15, 7, 11, 3, 13, 5, 9, 1, 14, 6, 10, 2, 12, 4, 8, 0];

  this.implement('dimmer', function() {
    this.sendAbsoluteDim = function(value) {
      var data = this.metadata.get('offId');
      if (value > 0) {
        var level = Math.ceil(value * 16); // value is [0, 1]

        // Add dimmer bits on top
        data = data + 0x8000000000;
        data = data + 0x0100000000 * this.dimLevels[level - 1];
      }
      
      // if dimming to zero, use send button off instead
      this.$rfTransceive.send('burst', 'Nexa2', data);
    };
  });

  this.implement('switch', function() {
    this.sendState = function(state) {
      var data = this.metadata.get('offId');
      if (state) {
        data = data - 0x8000000; // remove on/off bit
      }
      this.$rfTransceive.send('burst', 'Nexa2', data);
    };
  });
});
