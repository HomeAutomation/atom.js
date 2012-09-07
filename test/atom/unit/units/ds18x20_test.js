require('../../../test_helper');

var util = require('util');

var should = require('should');

var unitHelper = require('./unit_helper.js');
var Ds18x20 = require('../../../../lib/atom/unit/units/ds18x20').unit;

describe('DS18x20', function() {
  beforeEach(function() {
    this.config = {
      moduleId: 1,
      type: 'sns_DS18x20'
    };

    this.listeners = [];
    
    this.unit = Ds18x20(this.config, unitHelper.canIO, function() {});
    this.unit.start();
  });

  it('implements sensorControl and temperature', function() {
    this.unit.metadata.get('interfaces').should.eql(['sensorControl', 'temperature']);
  });

  it('listens for messages', function() {
    this.unit.listeners('message').length.should.eql(2);
  });

  describe('emitting', function() {
    beforeEach(function() {
      this.message = {
        header: {
          commandName: 'Temperature_Celsius'
        },
        body: {
          Value: 13.37,
          SensorId: 5
        }
      };
      this.sendTemp = function() {
        this.unit.emit('message', this.message);      
      };
    });
    
    it('emits a valid temperature event', function(done) {
      this.unit.on('temperature', function(event) {
        event.temperature.should.eql(13.37);
        event.sensorId.should.eql(5);
        event.originalEvent.should.eql(this.message);
        done();
      }.bind(this));
      this.sendTemp();
    });
  });
});