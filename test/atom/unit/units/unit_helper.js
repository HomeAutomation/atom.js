module.exports = {
  canIO: {
    messages: [],
    send: function(message) {
      this.messages.push(message);
    }
  },
  createDummyUnit: function() {
    return {
      listeners: [],
      on: function(event, listener) {
        this.listeners.push([event, listener]);
      }
    };
  }
}
