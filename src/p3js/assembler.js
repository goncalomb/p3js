/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

module.exports = function(p3js) {

	var assembler = { };
	eval(p3js.extractConstants());

	assembler.DEFAULT_VALIDATOR = function(inst) {
		switch (inst.d.type) {
			case "1":
				if (inst.o[0].type == OPRD_TYPE_IMMEDIATE && (
					inst.i == "NEG" || inst.i == "INC" || inst.i == "DEC" || inst.i == "COM" || inst.i == "POP"
				)) {
					throw inst.i + " cannot have immediate operand";
				}
				break;
			case "1c":
				if (inst.o[0].type == OPRD_TYPE_IMMEDIATE) {
					throw inst.i + " cannot have immediate operand";
				}
			case "2":
				if (inst.o[1].type == OPRD_TYPE_IMMEDIATE && (
					inst.i == "MUL" || inst.i == "DIV" || inst.i == "XCH"
				)) {
					throw inst.i + " cannot have immediate operand";
				}
				break;
		}
	}

	// The validator is a optional function to validate instructions.
	// The DEFAULT_VALIDATOR implements some checks that make the assembler
	// less abstract but more similar to the official one.

	assembler.assembleData = function(data, validator) {
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
			if (has_w(operand)) {
				if (typeof operand.w == "string") {
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

		var has_w = function(operand) {
			var m = get_m(operand);
			return (m == 2 || m == 3);
		}

		// first pass, record labels
		for (var i = 0, l = data.length; i < l; i++) {
			var inst = data[i];

			if (p3js.pseudoInstructions[inst.i]) {
				inst.d = p3js.pseudoInstructions[inst.i];
				inst.p = true;
			} else if (p3js.instructions[inst.i]) {
				inst.d = p3js.instructions[inst.i];
				inst.p = false;
			} else {
				throw "Internal Error: unknown instruction";
			}

			// inst.n = line number
			// inst.l = label
			// inst.i = instruction name
			// inst.c = condition (may be null)
			// inst.o = array of operands (may be empty)
			// inst.o[].type = operand type (OPRD_XXX)
			// inst.o[].r    = register (may not exist)
			// inst.o[].w    = constant (may not exist)
			// inst.o[].s    = constant sign (may not exist)
			// inst.d = instruction declaration
			// inst.p = is pseudo instruction?

			var num_operands = p3js.getNumOperands(inst.d.type);
			if (num_operands === null && inst.o.length < 1) {
				throw "Instruction " + inst.i + " expects at least 1 operand, on line " + inst.n;
			} else if (num_operands !== null && num_operands != inst.o.length) {
				throw "Instruction " + inst.i + " expects " + num_operands + " operand(s), on line " + inst.n;
			}

			// process pseudo-instructions
			if ((inst.i == "ORIG" || inst.i == "EQU" || inst.i == "WORD" || inst.i == "TAB") && inst.o[0].type != OPRD_TYPE_IMMEDIATE) {
				throw "Invalid operand for " + inst.i + " (expects constant), on line " + inst.n;
			}

			if ((inst.i == "ORIG" || inst.i == "EQU") && typeof inst.o[0].w == "string") {
				throw "Invalid operand for " + inst.i + " (cannot be a label), on line " + inst.n;
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

			switch (inst.d.type) {
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
					writer.movePosition(has_w(operand_0) ? 2 : 1);
					continue;
				case "2":
					writer.movePosition(has_w(operand_0) || has_w(operand_1) ? 2 : 1);
					continue;
			}
		}

		writer.setPosition(0);

		// second pass, assemble
		for (var i = 0, l = data.length; i < l; i++) {
			var inst = data[i];
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
					writer.write(get_w(inst.o[0]), 2);
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
					for (var j = 0; j < get_w(inst.o[0]); j++) {
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
			switch (inst.d.type) {
				case "0":
					writer.writeInstZero(inst.d.opcode);
					break;
				case "0c":
					if (operand_0.type != OPRD_TYPE_IMMEDIATE) {
						throw "Operand must be immediate, on line " + inst.n;
					}
					var w = get_w(operand_0);
					if (w < 0 || w > 1023) {
						throw "Constant must be between 0 and 1023, on line " + inst.n;
					}
					writer.writeInstConstant(inst.d.opcode, w);
					break;
				case "1":
				case "j":
					var m = get_m(operand_0);
					var r = get_r(operand_0);
					var w = get_w(operand_0);
					writer.writeInstOne(inst.d.opcode, m, r, w);
					break;
				case "1c":
					var m = get_m(operand_0);
					if (operand_1.type != OPRD_TYPE_IMMEDIATE) {
						throw "Second operand must be a constant, on line " + inst.n;
					}
					var c = get_w(operand_1);
					if (c < 0 || c > 15) {
						throw "Constant must be between 0 and 15, on line " + inst.n;
					}
					var r = get_r(operand_0);
					var w = get_w(operand_0);
					writer.writeInstOneC(inst.d.opcode, c, m, r, w);
					break;
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
						throw "One of the operands must be a register, on line " + inst.n;
					}
					var m = get_m(other_operand);
					var r = get_r(other_operand);
					var w = get_w(other_operand);
					writer.writeInstTwo(inst.d.opcode, s, reg, m, r, w);
					break;
				case "jc":
					var m = get_m(operand_0);
					var c = p3js.conditions[inst.c].code;
					var r = get_r(operand_0);
					var w = get_w(operand_0);
					writer.writeJumpC(inst.d.opcode, c, m, r, w);
					break;
				case "jr":
				case "jrc":
					if (operand_0.type != OPRD_TYPE_IMMEDIATE) {
						throw "Invalid operand for " + inst.i + ", on line " + inst.n;
					}
					var d = get_w(operand_0) - writer.getPosition() - 1;
					if (d < -32 || d > 31) {
						throw "Target too far for branch jump, on line " + inst.n;
					}
					if (inst.d.type == "jr") {
						writer.writeJumpR(inst.d.opcode, d);
					} else {
						var c = p3js.conditions[inst.c].code;
						writer.writeJumpRC(inst.d.opcode, c, d);
					}
					break;
				default:
					// should not happen
					throw "Internal Error: unknown instruction type";
			}

			// call the validator
			if (validator) {
				try {
					validator(inst);
				} catch (e) {
					if (typeof e == "string") {
						throw e + ", on line " + inst.n;
					}
				}
			}
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
