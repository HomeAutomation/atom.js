var util = require('util'),
    events = require('events');

var interfaces = require('./interfaces');

function Metadata(emitter, data) {
  this.emitter = emitter;
  this.data = data || {};
}

Metadata.prototype.set = function(name, value) {
  var oldValue = this.data[name];
  this.data[name] = value;
  this.emitter.emit('meta:' + name, value, oldValue);
};

Metadata.prototype.get = function(name) {
  return this.data[name];
};

function BaseUnit(config, canIO, initializer, selector) {
  events.EventEmitter.call(this);
  this.metadata = new Metadata(this, config);
  this.canIO = canIO;
  this.initializer = initializer;
  this.selector = selector;
}
util.inherits(BaseUnit, events.EventEmitter);

BaseUnit.prototype.implement = function(interfaceName, overrides, callback) {
  if (arguments.length < 3) {
    if (typeof overrides === 'function') {
      callback = overrides;
      overrides = [];
    } else {
      callback = function() {};
    }
  }
  if (arguments.length < 2) {
    overrides = [];
  }

  var theInterface = interfaces[interfaceName];
  theInterface.run(this.selector);
  
  if (theInterface.setUp) {
    theInterface.setUp.call(this);
  }
  
  var interfaceMetadata = theInterface.metadataDef;
  Object.keys(interfaceMetadata).forEach(function(metadataName) {
    if (overrides.indexOf(metadataName) === -1) {
      interfaceMetadata[metadataName].call(this);
    }
  }.bind(this));

  var interfaceEvent = theInterface.eventDef;
  Object.keys(interfaceEvent).forEach(function(eventName) {
    if (overrides.indexOf(eventName) === -1) {
      interfaceEvent[eventName].call(this);
    }
  }.bind(this));

  theInterface.getCommands().forEach(function(cmd) {
    this[cmd] = theInterface[cmd];
  }.bind(this));

  callback.call(this);
};

BaseUnit.prototype.send = function(message) {
  this.canIO.send(message);
};

BaseUnit.prototype.start = function() {
  this.initializer.call(this, this.selector);
};

BaseUnit.prototype.toString = function() {
  return "<Unit type=" + this.metadata.get('type') + ">";
};

exports.createUnit = function(callback) {
  return function(config, canIO, selector) {
    var unit = new BaseUnit(config, canIO, callback, selector);
    return unit;
  };
};

