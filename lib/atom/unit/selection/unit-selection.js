var unitStateManager = require('../unit-state-manager');

function UnitSelection(manager, units) {
  this.manager = manager;
  this.units = units;
  this.length = this.units.length;
  this.unitStateManager = new unitStateManager.UnitStateManager(manager, units);
}

UnitSelection.prototype.select = function(crit) {
  return select(this.manager, this.units, crit);
};

UnitSelection.prototype.toArray = function() {
  return this.units;
};

UnitSelection.prototype.toString = function() {
  return "<UnitSelection length=" + this.units.length + ">";
};

UnitSelection.prototype.on = function(event, callback) {
  if (UnitSelection.eventHandlers[event]) {
    UnitSelection.eventHandlers[event].call(this, callback);
    return;
  }
  this._onEvent.apply(this, arguments);
};

UnitSelection.eventHandlers = require('./event-handlers');
UnitSelection.fn = require('./fn');

Object.keys(UnitSelection.fn).forEach(function(name) {
  UnitSelection.prototype[name] = function() {
    var fnArgs = arguments;
    this.units.forEach(function(unit) {
      UnitSelection.fn[name].apply(unit, fnArgs);
    });
    return this;
  };
});

exports.UnitSelection = UnitSelection;