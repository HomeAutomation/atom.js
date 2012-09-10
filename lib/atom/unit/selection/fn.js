module.exports = {
  // See prototype.on, this is a fallback for regular events
  _onEvent: function(event, callback) {
    this.on(event, function() {
      callback.apply(this, [this].concat(Array.prototype.slice.call(arguments)));
    });
  },
  forEach: function(callback) {
    callback.call(this, this); // both bind this and give argument
  },
  send: function(command) {
    var capCommand = 'send' + command.charAt(0).toUpperCase() + command.slice(1);
    if (this[capCommand]) {
      var args = Array.prototype.slice.call(arguments, 1);
      this[capCommand].apply(this, args);
    }
  }
};
