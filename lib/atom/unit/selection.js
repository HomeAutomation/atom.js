var unitSelection = require('./selection/unit-selection');

var select = exports.select = function(manager, units, crit) {
  var filteredUnits = units.filter(function(unit) {
    return Object.keys(crit).every(function(key) {
      return unit.metadata.get(key) === crit[key];
    });
  });
  return new unitSelection.UnitSelection(manager, filteredUnits);
};
