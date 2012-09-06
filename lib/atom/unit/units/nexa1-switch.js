var _ = require('underscore');

var util = require('../unit-util');

exports.unit = util.createUnit(function($) {
  this.$rfTransceive = $(this.metadata.get('rfTransceiveSelector'));

  this.implement('switch', function() {
    this.sendState = function(state) {
      // offId is the ID of the off state for this switch/button
      var data = (this.metadata.get('offId') & 0x3FF) | ((state ? 0 : 1) << 11) | ((state ? 1 : 0) << 10); // 0 is on
      this.$rfTransceive.send('burst', 'Nexa', data);      
    };
  });
});
