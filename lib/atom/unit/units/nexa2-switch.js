var _ = require('underscore');

var util = require('../unit-util');

exports.unit = util.createUnit(function($) {
  // rfTransceive setup
  this.$rfTransceive = $(this.metadata.get('rfTransceiveSelector'));

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
