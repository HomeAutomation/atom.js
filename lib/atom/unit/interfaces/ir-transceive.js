var util = require('../interface-util');

exports.unitInterface = util.createInterface(function() {
  this.event('data', function() {
    this.on('message', function(message) {
      if (message.header.commandName === 'IR' &&
          message.header.directionFlagName === 'From_Owner') {
        var event = {
          data: message.body.IRdata,
          protocol: message.body.Protocol,
          channel: message.body.Channel,
          status: message.body.Status,
          pressed: message.body.Status === 'Pressed',
          released: message.body.Status === 'Released'
        };
        this.emit('data', event);
      }
    }.bind(this));
  });
  
  this.event('press', function() {
    this.on('data', function(event) {
      if (event.pressed) {
        this.emit('press', event);
      }
    }.bind(this));
  });

  this.event('release', function() {
    this.on('button', function(event) {
      if (event.released) {
        this.emit('release', event);
      }
    }.bind(this));
  });

  this.sendBurst = function(protocol, data, channel) {
    // default channel is 0
    channel = arguments.length < 3 ? 0 : channel;

    this.canIO.send({
      header: {
        className: 'sns',
        moduleId: this.metadata.get('moduleId'),
        moduleTypeName: this.metadata.get('type'),
        directionFlagName: 'To_Owner',
        commandName: 'IR'
      },
      body: {
        Channel: channel,
        Status: 'Burst',
        Protocol: protocol,
        IRdata: data
      }
    });
  };
});