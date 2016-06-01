module.exports = (function() {

	var p3j3 = window.p3js = { };

	p3js.pseudoInstructions = {
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

	p3js.instructions = { };
	for (var i = 0, l = instructions_raw.length; i < l; i++) {
		var parts = instructions_raw[i].replace(/\s+/g, " ").split(" ");
		p3js.instructions[parts[0].toUpperCase()] = {
			opcode: parseInt(parts[1], 2),
			type: parts[2]
		};
	}

	p3js.conditions = {
		"Z":  { code: 0 },
		"NZ": { code: 1 },
		"C":  { code: 2 },
		"NC": { code: 3 },
		"N":  { code: 4 },
		"NN": { code: 5 },
		"O":  { code: 6 },
		"NO": { code: 7 },
		"P":  { code: 8 },
		"NP": { code: 9 },
		"I":  { code: 10 },
		"NI": { code: 11 }
	};

	p3js.constants = {
		P3AS_MAGIC_NUMBER: 56347333,
		P3AS_MAGIC_NUMBER_OLD: 936854375,

		MEMORY_SIZE: (1 << 16), // 65536 positions
		MEMORY_WORD_SIZE: 2,    // 16 bits
		ROM_A_SIZE: (1 << 6),   // 64 positions
		ROM_A_WORD_SIZE: 2,     // 16 bits (only 9 are used)
		ROM_B_SIZE: (1 << 2),   // 16 positions
		ROM_B_WORD_SIZE: 2,     // 16 bits (only 9 are used)
		ROM_C_SIZE: (1 << 9),   // 512 positions
		ROM_C_WORD_SIZE: 4,     // 32 bits

		FIRST_ADDRESS: 0x0000,
		LAST_ADDRESS: 0xffff,
		IO_FIRST_ADDRESS: 0xff00,
		INTERRUPT_VECTOR_ADDRESS: 0xfe00, // default value, may be different if RomC was changed
		INTERRUPT_COUNT: 256,
		INTERRUPT_MASK_ADDRESS: 0xfffa,

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

	p3js.extractConstants = function() {
		var code = ["// use eval(p3js.extractConstants());\n"];
		for (var key in p3js.constants) {
			code.push("var " + key + " = p3js.constants[" + JSON.stringify(key) + "];\n");
		}
		return code.join("");
	}

	eval(p3js.extractConstants());

	p3js.getNumOperands = function(type) {
		if (type == "0")  return 0;
		if (type == "0c") return 1;
		if (type == "1")  return 1;
		if (type == "1c") return 2;
		if (type == "2")  return 2;
		if (type.charAt(0) == "j") return 1;
		return null
	}

	p3js.writeObjectFormat = function(memory, oldFormat) {
		var view_mem = new DataView(memory);
		var buffer = new ArrayBuffer(memory.byteLength * 2);
		var view = new DataView(buffer);
		var p = 0; // position on the output buffer
		if (!oldFormat) {
			view.setUint32(0, P3AS_MAGIC_NUMBER, true); // 32bit integer
			p = 4;
		} else {
			view.setUint32(0, P3AS_MAGIC_NUMBER_OLD, true); // 64bit integer
			view.setUint32(4, 0, true);
			p = 8
		}
		for (var i = 0, l = memory.byteLength; i < l; i += 2) {
			if (view_mem.getInt16(i, true) == 0) {
				continue;
			}
			var length_pos = p;
			p += 2;
			// write address of block
			view.setInt16(p, i/2, true);
			p += 2;
			// write data
			var j = i;
			for (; j < l; j += 2) {
				var v = view_mem.getInt16(j, true);
				if (v == 0) {
					break;
				}
				view.setInt16(p, v, true);
				p += 2;
			}
			// write length of block
			view.setInt16(length_pos, (j - i)/2, true);
			i = j;
		}
		view.setInt16(p, 0, true);
		p += 2;
		return buffer.slice(0, p);
	}

	p3js.ObjectCodeWriter = require("./ObjectCodeWriter.js")(p3js);

	p3js.parser = require("./parser.js")(p3js);
	p3js.assembler = require("./assembler.js")(p3js);
	require("./simulator.js")(p3js);

	return p3js;

})();
