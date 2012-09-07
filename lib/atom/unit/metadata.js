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

exports.Metadata = Metadata;