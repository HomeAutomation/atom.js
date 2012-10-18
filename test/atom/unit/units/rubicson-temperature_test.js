require('../../../test_helper');

var should = require('should');

var unitHelper = require('./unit_helper.js');
var RubicsonTemperature = require('../../../../lib/atom/unit/units/rubicson-temperature').unit;

describe('Rubicson Temperature', function() {
  beforeEach(function() {
    this.config = {
      channelId: 42816528227,
      rfTransceiveSelector: { a: 1 }
    };
    this.transceive = unitHelper.createDummyUnit();
    var selector = function() {
      return this.transceive;
    }.bind(this);
    this.unit = RubicsonTemperature(this.config, unitHelper.canIO, selector);
    this.unit.start();
  });

  it('uses "rfTransceiveSelector" to find rfTransceive', function(done) {
    var selector = function(obj) {
      obj.should.eql(this.config.rfTransceiveSelector);
      done();
      return this.transceive;
    }.bind(this);
    this.unit = RubicsonTemperature(this.config, unitHelper.canIO, selector);
    this.unit.start();
  });

  it('listens for data events on transceive', function() {
    this.transceive.listeners[0][0].should.eql('data');
    this.transceive.listeners[0][1].should.be.a('function');
  });

  it('ignores data with incorrect channel, but correct protocol', function() {
    this.unit.emit = function() {
      should.fail('emit unexpectedly called');
    };
    this.transceive.listeners[0][1](this.transceive, {
      protocol: 'Rubicson',
      data: 43655360355
    });
  });

  it('ignores data with correct id, but incorrect protocol', function() {
    this.unit.emit = function() {
      should.fail('emit unexpectedly called');
    };
    this.transceive.listeners[0][1](this.transceive, {
      protocol: 'Nexa2',
      data: 42816528227
    });
  });

  it('accepts correct data', function(done) {
    this.unit.emit = function() {
      done();
    };
    this.transceive.listeners[0][1](this.transceive, {
      protocol: 'Rubicson',
      data: 42816528227
    });
  });    

  describe('event emitting', function() {
    beforeEach(function() {
      this.emitted = [];
      this.unit.emit = function(event, eventData) {
        this.emitted.push([event, eventData]);
      }.bind(this);
      this.event = {
        protocol: 'Rubicson',
        data: 42816528227,
        status: 'Burst'
      };
      this.transceive.listeners[0][1](this.transceive, this.event);
    });

    it('emits exactly one temperature event', function() {
      this.emitted.length.should.eql(1);
    });

    it('emits event of type temperature', function() {
      this.emitted[0][0].should.eql('temperature');
    });
    
    it('includes original event', function() {
      this.emitted[0][1].originalEvent.should.eql(this.event);
    });

    describe('for temperature value 26.1 and channel 0', function() {
      it('includes the temperature value', function() {
        this.emitted[0][1].temperature.should.eql(26.1);
      });

      it('includes the channel id', function() {
        this.emitted[0][1].channel.should.eql(0);
      });
    });

    describe('for temperature value -7.9 and channel 1', function() {
      beforeEach(function() {
        this.config.channelId = 40417017614;
        this.transceive.listeners[0][1](this.transceive, {
          protocol: 'Rubicson',
          data: 40432766737
        });
      });
      
      it('includes the temperature value', function() {
        this.emitted[1][1].temperature.should.eql(-7.9);
      });

      it('includes the channel id', function() {
        this.emitted[1][1].channel.should.eql(1);
      });
    });
  });
});