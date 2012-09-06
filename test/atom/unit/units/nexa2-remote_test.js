require('../../../test_helper');

var should = require('should');

var unitHelper = require('./unit_helper.js');
var Nexa2Remote = require('../../../../lib/atom/unit/units/nexa2-remote').unit;

describe('Nexa2 Remote', function() {
  beforeEach(function() {
    this.config = {
      offId: 2128979239,
      rfTransceiveSelector: { a: 1 }
    };
    this.transceive = unitHelper.createDummyUnit();
    var selector = function() {
      return this.transceive;
    }.bind(this);
    this.unit = Nexa2Remote(this.config, unitHelper.canIO, selector);
    this.unit.start();
  });

  it('uses "rfTransceiveSelector" to find rfTransceive', function(done) {
    var selector = function(obj) {
      obj.should.eql(this.config.rfTransceiveSelector);
      done();
      return this.transceive;
    }.bind(this);
    this.unit = Nexa2Remote(this.config, unitHelper.canIO, selector);
    this.unit.start();
  });

  it('listens for data events on transceive', function() {
    this.transceive.listeners[0][0].should.eql('data');
    this.transceive.listeners[0][1].should.be.a('function');
  });

  it('ignores data with incorrect id, but correct protocol', function() {
    this.unit.emit = function() {
      should.fail('emit unexpectedly called');
    };
    this.transceive.listeners[0][1](this.transceive, {
      protocol: 'Nexa2',
      data: 2128979239 + 0xFFF // random change
    });
  });

  it('ignores data with correct id, but incorrect protocol', function() {
    this.unit.emit = function() {
      should.fail('emit unexpectedly called');
    };
    this.transceive.listeners[0][1](this.transceive, {
      protocol: 'Nexa1',
      data: this.config.offId
    });
  });

  it('accepts correct data', function(done) {
    this.unit.emit = function() {
      done();
    };
    this.transceive.listeners[0][1](this.transceive, {
      protocol: 'Nexa2',
      data: this.config.offId
    });
  });

  describe('event emitting', function() {
    beforeEach(function() {
      this.emitted = [];
      this.unit.emit = function(event, eventData) {
        this.emitted.push([event, eventData]);
      }.bind(this);
      this.event = {
        protocol: 'Nexa2',
        data: 4142245159 // 0 on
      };
      this.transceive.listeners[0][1](this.transceive, this.event);
    });

    it('emits exactly one button event', function() {
      this.emitted.length.should.eql(1);
    });

    it('emits event of type button', function() {
      this.emitted[0][0].should.eql('button');
    });

    it('includes original event', function() {
      this.emitted[0][1].originalEvent.should.eql(this.event);
    });

    describe('for button 0, on', function() {
      it('emits an event with isOn false', function() {
        this.emitted[0][1].isOn.should.eql(true);
      });

      it('emits an event with button number 0', function() {
        this.emitted[0][1].buttonNumber.should.eql(0);
      });      
    });

    describe('for button 3, off', function() {
      beforeEach(function() {
        this.transceive.listeners[0][1](this.transceive, {
          protocol: 'Nexa2',
          data: 1055237415 // 3 off
        });
      });
      
      it('emits an event with isOn true', function() {
        this.emitted[1][1].isOn.should.eql(false);
      });

      it('emits an event with button number 3', function() {
        this.emitted[1][1].buttonNumber.should.eql(3);
      });      
    });

  });
});