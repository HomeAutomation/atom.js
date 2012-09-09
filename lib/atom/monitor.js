var net = require('net'),
    moment = require('moment'),
    _s = require('underscore.string');

var log = require('./logging');

function Monitor(config, canIO) {

  var self = this;
  this.config = config;
  this.clients = [];
  this.canIO = canIO;

  this.start();

  canIO.on('message', function(message) {
    self.handleCanData(message);
  });
}

Monitor.prototype.start = function() {
  var self = this;
  this.server = net.createServer(function(sock) {
    log.info('Monitor: Client connected from ' + sock.remoteAddress +':'+ sock.remotePort);

    self.clients.push(sock);

    sock.on('data', function(data) {
      if (data.toString().substr(0, ("quit").length) === "quit") {
        log.info('Client at ' + sock.remoteAddress +':'+ sock.remotePort + ' requested to be disconnected');
        sock.end();
      } else {
        log.info('Client at ' + sock.remoteAddress + ':' + sock.remotePort  + ' sent us data: ' + data);
      }
    });

    sock.on('close', function(data) {
      self.clients = self.clients.filter(function(obj) {
        return obj != sock;
      });
    });
  }).listen(this.config.monitor.port);

  this.server.on("listening", function () {
    var address = self.server.address();
    log.info("Monitor server listening " +
                address.address + ":" + address.port);
  });
};

Monitor.prototype.handleCanData = function(message) {
  var timestamp = moment().format('YYYY-MM-DD HH:mm:ss.SSS') + " - ";

  var type;
  if (message.header.className == "nmt") {
    type = "NMT";
  } else {
    if (message.header.directionFlagName == "To_Owner") {
      type = "RX";
    } else if (message.header.directionFlagName == "From_Owner") {
      type = "TX";
    } else {
      type = "??";
    }
  }

  var command =  message.header.commandName;

  var module;
  if (message.header.className == "nmt") {
    module = "-";
  } else {
    module = message.header.className;
    module += "_" + (message.header.moduleTypeName || '');
    module += ":" + message.header.moduleId;
  }

  var body = Object.keys(message.body).map(function(name) {
    return name + "=" + message.body[name];
  }).join(' ');

  var line = _s.sprintf("%s %-3s %-12s %-20s %s\n", timestamp, type, command, module, body);

  this.clients.forEach(function(client) {
    client.write(line);
  });
};

exports.Monitor = Monitor;

