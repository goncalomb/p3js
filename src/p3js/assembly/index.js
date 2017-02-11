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

assembly.pseudoInstructions = {
	"ORIG": { type: "0c", requiresLabel: false },
	"EQU":  { type: "0c", requiresLabel: true  },
	"WORD": { type: "0c", requiresLabel: true  },
	"STR":  { type: "s",  requiresLabel: true  },
	"TAB":  { type: "0c", requiresLabel: true  }
};

//   Name  Opcode   Type
var instructions_raw = [
	// 0 operands
	"NOP   000000   0",
	"ENI   000001   0",
	"DSI   000010   0",
	"STC   000011   0",
	"CLC   000100   0",
	"CMC   000101   0",
	"RET   000110   0",
	"RTI   000111   0",
	// 0 operands with constant
	"INT   001000   0c",
	"RETN  001001   0c",
	// 1 operand
	"NEG   010000   1",
	"INC   010001   1",
	"DEC   010010   1",
	"COM   010011   1",
	"PUSH  010100   1",
	"POP   010101   1",
	// 1 operand with constant
	"SHR   011000   1c",
	"SHL   011001   1c",
	"SHRA  011010   1c",
	"SHLA  011011   1c",
	"ROR   011100   1c",
	"ROL   011101   1c",
	"RORC  011110   1c",
	"ROLC  011111   1c",
	// 2 operands
	"CMP   100000   2",
	"ADD   100001   2",
	"ADDC  100010   2",
	"SUB   100011   2",
	"SUBB  100100   2",
	"MUL   100101   2",
	"DIV   100110   2",
	"TEST  100111   2",
	"AND   101000   2",
	"OR    101001   2",
	"XOR   101010   2",
	"MOV   101011   2",
	"MVBH  101100   2",
	"MVBL  101101   2",
	"XCH   101110   2",
	// jump
	"JMP   110000   j",
	"CALL  110010   j",
	// jump conditional
	"JMP.  110001   jc",
	"CALL. 110011   jc",
	// jump relative
	"BR    111000   jr",
	// jump relative conditional
	"BR.   111001   jrc"
];

assembly.instructions = { };
for (var i = 0, l = instructions_raw.length; i < l; i++) {
	var parts = instructions_raw[i].replace(/\s+/g, " ").split(" ");
	assembly.instructions[parts[0].toUpperCase()] = {
		opcode: parseInt(parts[1], 2),
		type: parts[2]
	};
}

assembly.conditions = {
	"Z": 0, "NZ": 1, "C": 2, "NC": 3, "N": 4, "NN": 5,
	"O": 6, "NO": 7, "P": 8, "NP": 9, "I": 10, "NI": 11
}

assembly.getNumOperands = function(type) {
	if (type == "0")  return 0;
	if (type == "0c") return 1;
	if (type == "1")  return 1;
	if (type == "1c") return 2;
	if (type == "2")  return 2;
	if (type.charAt(0) == "j") return 1;
	return null
}

assembly.AssemblerResult = require("./AssemblerResult.js");
assembly.Instruction = require("./Instruction.js");
assembly.ObjectCodeWriter = require("./ObjectCodeWriter.js");
assembly.assembler = require("./assembler.js");
assembly.parser = require("./parser.js");

assembly.assembleWithDefaultValidator = function(text) {
	var data = assembly.parser.parseString(text);
	return assembly.assembler.assembleData(data, assembly.assembler.DEFAULT_VALIDATOR);
}
