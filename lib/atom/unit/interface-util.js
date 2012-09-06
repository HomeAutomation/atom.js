function InterfaceBuilder(callback) {
  this.callback = callback;
  this.metadataDef = {};
  this.eventDef = {};
  this.started = false;
}

InterfaceBuilder.prototype.run = function(selector) {
  if (!this.started) {
    this.callback.call(this, selector);
    this.started = true;
  }
};

InterfaceBuilder.prototype.metadata = function(name, callback) {
  this.metadataDef[name] = callback;
};

InterfaceBuilder.prototype.event = function(name, callback) {
  this.eventDef[name] = callback;
};

InterfaceBuilder.prototype.getCommands = function() {
  return Object.keys(this).reduce(function(acc, key) {
    if (key.substring(0, 4) === 'send') {
      acc.push(key);
    }
    return acc;
  }, []);
};

exports.createInterface = function(callback) {
  return new InterfaceBuilder(callback);
};
