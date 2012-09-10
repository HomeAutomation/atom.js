module.exports = {
  online: function(callback) {
    this.unitStateManager.on('online', callback);
  },
  
  offline: function(callback) {
    this.unitStateManager.on('offline', callback);
  }
};