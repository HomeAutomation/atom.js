var util = require('util'),
    events = require('events');

function UnitStateManager(manager, units) {
  events.EventEmitter.call(this);

  this.units = units;

  this.onlineCount = units.reduce(function(memo, unit) {
    return memo + unit.online ? 1 : 0;
  }, 0);

  manager.on('unit.online', function(unit) {
    if (this.units.indexOf(unit) !== -1) {
      this.onlineCount += 1;
      this.emit('online', unit, this.onlineCount, this.onlineCount == this.units.length);
    }
  }.bind(this));
  
  manager.on('unit.offline', function(unit) {
    if (this.units.indexOf(unit) !== -1) {
      this.onlineCount -= 1;
      this.emit('offline', unit, this.onlineCount, this.onlineCount == 0);
    }
  }.bind(this));
}
util.inherits(UnitStateManager, events.EventEmitter);

exports.UnitStateManager = UnitStateManager;