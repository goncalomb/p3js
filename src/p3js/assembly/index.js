var assembly = module.exports = { };
var p3js = require("../p3js.js");
assembly.ObjectCodeWriter = require("./ObjectCodeWriter.js");
assembly.assembler = require("./assembler.js")(p3js);
assembly.parser = require("./parser.js")(p3js);

assembly.assembleWithDefaultValidator = function(text) {
	var data = assembly.parser.parseString(text);
	return assembly.assembler.assembleData(data, assembly.assembler.DEFAULT_VALIDATOR);
}
