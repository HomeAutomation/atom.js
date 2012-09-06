require('../../../test_helper');

var should = require('should');

var unitHelper = require('./unit_helper.js');
var Nexa2Dimmer = require('../../../../lib/atom/unit/units/nexa2-dimmer').unit;

describe('Nexa2 Dimmer', function() {
  beforeEach(function() {
    this.config = {
      offId: 4276462887,
      rfTransceiveSelector: { a: 1 }
    };
    this.transceive = unitHelper.createDummyUnit();
    var selector = function() {
      return this.transceive;
    }.bind(this);
    this.unit = Nexa2Dimmer(this.config, unitHelper.canIO, selector);
    this.unit.start();
  });

  it('uses "rfTransceiveSelector" to find rfTransceive', function(done) {
    var selector = function(obj) {
      obj.should.eql(this.config.rfTransceiveSelector);
      done();
      return this.transceive;
    }.bind(this);
    this.unit = Nexa2Dimmer(this.config, unitHelper.canIO, selector);
    this.unit.start();
  });

  describe('#sendState', function() {
    it('encodes on correctly', function(done) {
      this.transceive.send = function(event, protocol, data) {
        event.should.eql('burst');
        protocol.should.eql('Nexa2');
        data.should.eql(this.config.offId - 0x8000000);
        done();
      }.bind(this);
      this.unit.sendState(true);
    });

    it('encodes off correctly', function(done) {
      this.transceive.send = function(event, protocol, data) {
        event.should.eql('burst');
        protocol.should.eql('Nexa2');
        data.should.eql(this.config.offId);
        done();
      }.bind(this);
      this.unit.sendState(false);
    });
  });

  describe('#sendAbsoluteDim', function() {
    it('encodes 0 correctly', function(done) {
      this.transceive.send = function(event, protocol, data) {
        event.should.eql('burst');
        protocol.should.eql('Nexa2');
        data.should.eql(this.config.offId);
        done();
      }.bind(this);
      this.unit.sendAbsoluteDim(0);
    });
    
    it('encodes 0.3 correctly', function(done) {
      this.transceive.send = function(event, protocol, data) {
        event.should.eql('burst');
        protocol.should.eql('Nexa2');
        data.should.eql(this.config.offId +
                        0x8000000000 +
                        0x0100000000 * 13);
        done();
      }.bind(this);
      this.unit.sendAbsoluteDim(0.3);
    });

    it('encodes 1.0 correctly', function(done) {
      this.transceive.send = function(event, protocol, data) {
        event.should.eql('burst');
        protocol.should.eql('Nexa2');
        data.should.eql(this.config.offId +
                        0x8000000000 +
                        0x0100000000 * 0);
        done();
      }.bind(this);
      this.unit.sendAbsoluteDim(1.0);
    });
  });
});