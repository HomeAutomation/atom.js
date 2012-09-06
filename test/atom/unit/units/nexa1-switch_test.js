require('../../../test_helper');

var should = require('should');

var unitHelper = require('./unit_helper.js');
var Nexa1Switch = require('../../../../lib/atom/unit/units/nexa1-switch').unit;

describe('Nexa1 Switch', function() {
  beforeEach(function() {
    this.config = {
      offId: 2105,
      rfTransceiveSelector: { a: 1 }
    };
    this.transceive = unitHelper.createDummyUnit();
    var selector = function() {
      return this.transceive;
    }.bind(this);
    this.unit = Nexa1Switch(this.config, unitHelper.canIO, selector);
    this.unit.start();
  });

  it('uses "rfTransceiveSelector" to find rfTransceive', function(done) {
    var selector = function(obj) {
      obj.should.eql(this.config.rfTransceiveSelector);
      done();
      return this.transceive;
    }.bind(this);
    this.unit = Nexa1Switch(this.config, unitHelper.canIO, selector);
    this.unit.start();
  });

  describe('#sendState', function() {
    it('encodes on correctly', function(done) {
      this.transceive.send = function(event, protocol, data) {
        event.should.eql('burst');
        protocol.should.eql('Nexa');
        data.should.eql(1081);
        done();
      }.bind(this);
      this.unit.sendState(true);
    });

    it('encodes off correctly', function(done) {
      this.transceive.send = function(event, protocol, data) {
        event.should.eql('burst');
        protocol.should.eql('Nexa');
        data.should.eql(2105);
        done();
      }.bind(this);
      this.unit.sendState(false);
    });
  });
});