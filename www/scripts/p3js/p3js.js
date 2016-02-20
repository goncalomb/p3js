(function() {

	var p3js = window.p3js = (window.p3js || { });

	p3js.pseudoInstructions = {
		"orig": { type: "0c", requiresLabel: false },
		"equ":  { type: "0c", requiresLabel: true  },
		"word": { type: "0c", requiresLabel: true  },
		"str":  { type: "s",  requiresLabel: true  },
		"tab":  { type: "0c", requiresLabel: true  },
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
		// jump conditional
		"JMP.  110001   jc",
		// jump
		"CALL  110010   j",
		// jump conditional
		"CALL. 110011   jc",
		// jump relative
		"BR    111000   jr",
		// jump relative conditional
		"BR.   111001   jrc"
	];

	p3js.instructions = { };
	for (var i = 0, l = instructions_raw.length; i < l; i++) {
		var parts = instructions_raw[i].replace(/\s+/g, " ").split(" ");
		p3js.instructions[parts[0].toLowerCase()] = {
			opcode: parseInt(parts[1], 2),
			type: parts[2]
		};
	}

	p3js.conditions = {
		"z": 1, "nz": 1, "c": 1, "nc": 1, "n": 1, "nn": 1, "o": 1, "no": 1, "p": 1, "np": 1, "i": 1, "ni": 1
	};

	if (Object.freeze) {
		Object.freeze(p3js.pseudoInstructions);
		Object.freeze(p3js.conditions);
		Object.freeze(p3js.instructions);
	}

})();
