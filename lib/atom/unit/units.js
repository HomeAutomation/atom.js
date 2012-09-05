var fs = require('fs'),
    path = require('path');

var dashToCamel = function(string, capitalize) {
  capitalize = arguments.length < 2 ? true : capitalize;
  var regex = capitalize ? /(?:\-|^)(\w)/g : /\-(\w)/g;
  return string.replace(regex, function(s, c) {
    return c.toUpperCase();
  });
};

var baseDir = path.join(__dirname, 'units');

var addPath = function(names, dir) {
  return names.map(function(filename) {
    return path.join(dir, filename);
  });
}

units = addPath(fs.readdirSync(baseDir), baseDir);

units.forEach(function(unitPath) {
  var name = dashToCamel(path.basename(unitPath, '.js'));
  exports[name] = require(unitPath).unit;
});
