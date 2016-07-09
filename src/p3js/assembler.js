module.exports = function(p3js) {

	var assembler = { };
	eval(p3js.extractConstants());

	assembler.assembleData = function(data) {
		var writer = new p3js.ObjectCodeWriter();
		var labels = { };

		var result = {
			buffer: writer.buffer,
			usedAddresses: null,
			labels: labels,
			labelCount: 0,
			pseudoCount: 0,
			instructionCount: 0,
			memoryUsage: 0
		}

		var set_label = function(label, value) {
			if (labels[label] !== undefined) {
				throw "Label " + label + " already defined, on line " + inst.n;
			}
			labels[label] = value;
			result.labelCount++;
		}

		var get_w = function(operand) {
			if (operand.w !== undefined) { // TODO: don't check for w, use type
				if (typeof operand.w.valueOf() == "string") {
					if (labels[operand.w] === undefined) {
						throw "Undefined label " + operand.w + ", on line " + inst.n;
					} if (operand.s == "-") {
						return -labels[operand.w];
					} else {
						return labels[operand.w];
					}
				}
				return operand.w;
			}
			return 0;
		}

		var get_m = function(operand) {
			switch (operand.type) {
				case OPRD_TYPE_REGISTER:
				case OPRD_TYPE_SP:
				case OPRD_TYPE_PC:
					return 0;
				case OPRD_TYPE_REGISTER_INDIRECT:
					return 1;
				case OPRD_TYPE_IMMEDIATE:
					return 2;
				case OPRD_TYPE_DIRECT:
				case OPRD_TYPE_INDEXED:
				case OPRD_TYPE_RELATIVE:
				case OPRD_TYPE_BASED:
					return 3;
			}
			throw "Invalid operand for " + inst.i + ", on line " + inst.n;
		}

		// call get_r after a successful get_m
		var get_r = function(operand) {
			if (operand.type == OPRD_TYPE_IMMEDIATE || operand.type == OPRD_TYPE_DIRECT) {
				return REGISTER_0
			}
			return operand.r;
		}

		// first pass, record labels
		for (var i = 0, l = data.length; i < l; i++) {
			var inst = data[i];
			// inst.n: line #; inst.l: label; inst.i: instruction; inst.c: condition; inst.o: operands;
			var inst_dec = (p3js.instructions[inst.i] ? p3js.instructions[inst.i] : p3js.pseudoInstructions[inst.i]);
			var num_operands = p3js.getNumOperands(inst_dec.type);
			if (num_operands === null && inst.o.length < 1) {
				throw "Instruction " + inst.i + " expects at least 1 operand, on line " + inst.n;
			} else if (num_operands !== null && num_operands != inst.o.length) {
				throw "Instruction " + inst.i + " expects " + num_operands + " operand(s), on line " + inst.n;
			}

			// process pseudo-instructions
			if (
				(inst.i == "ORIG" || inst.i == "EQU" || inst.i == "WORD" || inst.i == "TAB") &&
				inst.o[0].type != OPRD_TYPE_IMMEDIATE
				// TODO: check if inst.o[0].w is a label!!! don't allow labels.
			) {
				throw "Invalid operand for " + inst.i + ", on line " + inst.n;
			}

			switch (inst.i) {
				case "ORIG":
					writer.setPosition(inst.o[0].w);
					continue;
				case "EQU":
					set_label(inst.l, inst.o[0].w);
					continue;
				case "WORD":
					set_label(inst.l, writer.getPosition());
					writer.movePosition(1);
					continue;
				case "STR":
					set_label(inst.l, writer.getPosition());
					inst.o.forEach(function(o) {
						if (o.type == OPRD_TYPE_STRING) {
							writer.movePosition(o.w.length);
						} else if (o.type == OPRD_TYPE_IMMEDIATE) {
							writer.movePosition(1);
						} else {
							throw "Invalid operand for STR, on line " + inst.n;
						}
					});
					continue;
				case "TAB":
					set_label(inst.l, writer.getPosition());
					writer.movePosition(inst.o[0].w);
					continue;
			}

			if (inst.l) {
				set_label(inst.l, writer.getPosition());
			}

			// process instructions
			var operand_0 = inst.o[0];
			var operand_1 = inst.o[1];

			switch (inst_dec.type) {
				case "0":
				case "0c":
				case "jr":
				case "jrc":
					writer.movePosition(1);
					continue;
				case "1":
				case "1c":
				case "j":
				case "jc":
					if (operand_0.w === undefined) { // TODO: don't check for w, use type
						writer.movePosition(1);
					} else {
						writer.movePosition(2);
					}
					continue;
				case "2":
					if (operand_0.w === undefined && operand_1.w === undefined) { // TODO: don't check for w, use type
						writer.movePosition(1);
					} else {
						writer.movePosition(2);
					}
					continue;
			}
		}

		writer.setPosition(0);

		// second pass, assemble
		for (var i = 0, l = data.length; i < l; i++) {
			var inst = data[i];
			// inst.n: line #; inst.l: label; inst.i: instruction; inst.c: condition; inst.o: operands;
			var inst_dec = (p3js.instructions[inst.i] ? p3js.instructions[inst.i] : p3js.pseudoInstructions[inst.i]);
			// no need to recheck number of operands

			// process pseudo-instructions
			result.pseudoCount++;
			switch (inst.i) {
				case "ORIG":
					writer.setPosition(inst.o[0].w);
					continue;
				case "EQU":
					// done on first pass
					continue;
				case "WORD":
					writer.write(inst.o[0].w, 2);
					continue;
				case "STR":
					inst.o.forEach(function(o) {
						if (o.type == OPRD_TYPE_STRING) {
							for (var j = 0, l = o.w.length; j < l; j++) {
								writer.write(o.w.charCodeAt(j), 3);
							}
						} else if (o.type == OPRD_TYPE_IMMEDIATE) {
							writer.write(get_w(o), 3);
						} else {
							throw "Invalid operand for STR, on line " + inst.n;
						}
					});
					continue;
				case "TAB":
					for (var j = 0; j < inst.o[0].w; j++) {
						writer.write(0, 4);
					}
					continue;
			}
			result.pseudoCount--; // smart way to count pseudo instructions

			// check if the labels are correctly placed
			if (inst.l) {
				if (labels[inst.l] === undefined || labels[inst.l] != writer.getPosition()) {
					// should not happen
					throw "Internal Error: first pass failed";
				}
			}

			// process instructions
			var operand_0 = inst.o[0];
			var operand_1 = inst.o[1];

			result.instructionCount++;
			switch (inst_dec.type) {
				case "0":
					writer.writeInstZero(inst_dec.opcode);
					continue;
				case "0c":
					if (operand_0.type != OPRD_TYPE_IMMEDIATE) {
						throw "Invalid operand for " + inst.i + ", on line " + inst.n;
					}
					var w = get_w(operand_0);
					// TODO: check constant size, these constants are 10 bit long
					writer.writeInstConstant(inst_dec.opcode, w);
					continue;
				case "1":
				case "j":
					var m = get_m(operand_0);
					var r = get_r(operand_0);
					var w = get_w(operand_0);
					// XXX: some instructions may not accept OPRD_TYPE_IMMEDIATE
					// XXX: do some tests with OPRD_TYPE_SP and OPRD_TYPE_BASED
					writer.writeInstOne(inst_dec.opcode, m, r, w);
					continue;
				case "1c":
					var m = get_m(operand_0);
					if (operand_1.type != OPRD_TYPE_IMMEDIATE) {
						throw "Invalid operand for " + inst.i + ", on line " + inst.n;
					}
					var c = get_w(operand_1);
					var r = get_r(operand_0);
					var w = get_w(operand_0);
					// TODO: don't accept OPRD_TYPE_IMMEDIATE
					// TODO: check constant size, these constants are 4 bit long
					writer.writeInstOneC(inst_dec.opcode, c, m, r, w);
					continue;
				case "2":
					if (operand_0.type == OPRD_TYPE_IMMEDIATE) {
						throw "Fist operand cannot be immediate, on line " + inst.n;
					}
					var s, reg, other_operand;
					if (operand_0.type == OPRD_TYPE_REGISTER) {
						s = 1;
						reg = operand_0.r;
						other_operand = operand_1;
					} else if (operand_1.type == OPRD_TYPE_REGISTER) {
						s = 0;
						reg = operand_1.r;
						other_operand = operand_0;
					} else {
						throw "One of the operands must be a resister, on line " + inst.n;
					}
					if (other_operand.type == OPRD_TYPE_IMMEDIATE && (inst.i == "MUL" || inst.i == "DIV" || inst.i == "XCH")) {
						throw inst.i + " cannot have immediate operand, on line " + inst.n;
					}
					// XXX: test other special cases (SP etc.)
					var m = get_m(other_operand);
					var r = get_r(other_operand);
					var w = get_w(other_operand);
					writer.writeInstTwo(inst_dec.opcode, s, reg, m, r, w);
					continue;
				case "jc":
					var m = get_m(operand_0);
					var c = p3js.conditions[inst.c].code;
					var r = get_r(operand_0);
					var w = get_w(operand_0);
					writer.writeJumpC(inst_dec.opcode, c, m, r, w);
					continue;
				case "jr":
					if (operand_0.type != OPRD_TYPE_IMMEDIATE) {
						throw "Invalid operand for " + inst.i + ", on line " + inst.n;
					}
					var d = get_w(operand_0) - writer.getPosition() - 1;
					// TODO: check jump distance
					writer.writeJumpR(inst_dec.opcode, d);
					continue;
				case "jrc":
					if (operand_0.type != OPRD_TYPE_IMMEDIATE) {
						throw "Invalid operand for " + inst.i + ", on line " + inst.n;
					}
					var c = p3js.conditions[inst.c].code;
					var d = get_w(operand_0) - writer.getPosition() - 1;
					// TODO: check jump distance
					writer.writeJumpRC(inst_dec.opcode, c, d);
					continue;
			}
			// should not happen
			throw "Internal Error: unknown instruction type";
		}

		result.usedAddresses = writer.getUsedAddresses();
		result.usedAddresses.forEach(function(v) {
			if (v) {
				result.memoryUsage++;
			}
		});
		return result;
	};

	return assembler;

}
