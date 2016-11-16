var assembly = module.exports = {
	REGISTER_0: 0,
	REGISTER_SP: 14,
	REGISTER_PC: 15,

	OPRD_TYPE_STRING: -1,           // 'Test String'
	OPRD_TYPE_REGISTER: 0,          // Rx
	OPRD_TYPE_REGISTER_INDIRECT: 1, // M[Rx]
	OPRD_TYPE_IMMEDIATE: 2,         // W
	OPRD_TYPE_DIRECT: 3,            // M[W]
	OPRD_TYPE_INDEXED: 4,           // M[Rx+W]
	OPRD_TYPE_RELATIVE: 5,          // M[PC+W]
	OPRD_TYPE_BASED: 6,             // M[SP+W]
	OPRD_TYPE_PC: 7,                // PC
	OPRD_TYPE_SP: 8                 // SP
};

assembly.ObjectCodeWriter = require("./ObjectCodeWriter.js");
assembly.assembler = require("./assembler.js");
assembly.parser = require("./parser.js");

assembly.assembleWithDefaultValidator = function(text) {
	var data = assembly.parser.parseString(text);
	return assembly.assembler.assembleData(data, assembly.assembler.DEFAULT_VALIDATOR);
}
