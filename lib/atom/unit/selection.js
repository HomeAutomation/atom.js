var unitStateManager = require('./unit-state-manager');

var select = exports.select = function(manager, crit) {
  var filteredUnits = manager.units.filter(function(unit) {
    return Object.keys(crit).every(function(key) {
      return unit.metadata.get(key) === crit[key];
    });
  });
  return new UnitSelection(manager, filteredUnits);
};

function UnitSelection(manager, units) {
  this.manager = manager;
  this.units = units;
  this.length = this.units.length;
  this.unitStateManager = new unitStateManager.UnitStateManager(manager, units);
}

UnitSelection.prototype.select = function(crit) {
  return new UnitSelection(select(this.units, crit));
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

UnitSelection.eventHandlers = {};
UnitSelection.eventHandlers.online = function(callback) {
  this.unitStateManager.on('online', callback);
};

UnitSelection.eventHandlers.offline = function(callback) {
  this.unitStateManager.on('offline', callback);
};

UnitSelection.fn = {};

// See prototype.on above
UnitSelection.fn._onEvent = function(event, callback) {
  this.on(event, function() {
    callback.apply(this, [this].concat(Array.prototype.slice.call(arguments)));
  });
};

UnitSelection.fn.forEach = function(callback) {
  callback.call(this, this); // both bind this and give argument
};

UnitSelection.fn.send = function(command) {
  var capCommand = 'send' + command.charAt(0).toUpperCase() + command.slice(1);
  if (this[capCommand]) {
    var args = Array.prototype.slice.call(arguments, 1);
    this[capCommand].apply(this, args);
  }
};

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

