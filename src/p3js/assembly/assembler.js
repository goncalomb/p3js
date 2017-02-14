var assembler = module.exports = { };
var assembly = require("./");
var AssemblerError = require("./AssemblerError.js");

assembler.DEFAULT_VALIDATOR = function(instruction) {
	var name = instruction.name;
	switch (instruction.getType()) {
		case "1":
			if (instruction.operands[0].type == assembly.OPRD_TYPE_IMMEDIATE && (
				name == "NEG" || name == "INC" || name == "DEC" || name == "COM" || name == "POP"
			)) {
				throw name + " cannot have immediate operand";
			}
			break;
		case "1c":
			if (instruction.operands[0].type == assembly.OPRD_TYPE_IMMEDIATE) {
				throw name + " cannot have immediate operand";
			}
		case "2":
			if (instruction.operands[1].type == assembly.OPRD_TYPE_IMMEDIATE && (
				name == "MUL" || name == "DIV" || name == "XCH"
			)) {
				throw name + " cannot have immediate operand";
			}
			break;
	}
}

// The validator is a optional function to validate instructions.
// The DEFAULT_VALIDATOR implements some checks that make the assembler
// less abstract but more similar to the official one.

assembler.assembleData = function(data, validator) {
	var result = new assembly.AssemblerResult();
	var writer = new assembly.ObjectCodeWriter(result);
	var labels = result.labels;

	var set_label = function(label, value) {
		if (labels[label] !== undefined) {
			throw new AssemblerError("Label " + label + " already defined");
		}
		labels[label] = value;
		result.labelCount++;
	}

	var get_w = function(operand) {
		if (has_w(operand)) {
			if (typeof operand.w == "string") {
				if (labels[operand.w] === undefined) {
					throw new AssemblerError("Undefined label " + operand.w);
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
			case assembly.OPRD_TYPE_REGISTER:
			case assembly.OPRD_TYPE_SP:
			case assembly.OPRD_TYPE_PC:
				return 0;
			case assembly.OPRD_TYPE_REGISTER_INDIRECT:
				return 1;
			case assembly.OPRD_TYPE_IMMEDIATE:
				return 2;
			case assembly.OPRD_TYPE_DIRECT:
			case assembly.OPRD_TYPE_INDEXED:
			case assembly.OPRD_TYPE_RELATIVE:
			case assembly.OPRD_TYPE_BASED:
				return 3;
		}
		throw new AssemblerError("Invalid operand for {name}");
	}

	// call get_r after a successful get_m
	var get_r = function(operand) {
		if (operand.type == assembly.OPRD_TYPE_IMMEDIATE || operand.type == assembly.OPRD_TYPE_DIRECT) {
			return assembly.REGISTER_0
		}
		return operand.r;
	}

	var has_w = function(operand) {
		var m = get_m(operand);
		return (m == 2 || m == 3);
	}

	// first pass, record labels
	for (var i = 0, l = data.length; i < l; i++) {
		var instruction = data[i];
		AssemblerError.prepare(instruction, result);

		if (!instruction.isPseudoInstruction() && !instruction.isInstruction()) {
			throw "Internal Error: unknown instruction";
		}

		// instruction.operands        = array of operands (may be empty)
		// instruction.operands[].type = operand type (OPRD_XXX)
		// instruction.operands[].r    = register (may not exist)
		// instruction.operands[].w    = constant (may not exist)
		// instruction.operands[].s    = constant sign (may not exist)

		var num_operands = instruction.getNumOperands();
		if (num_operands === null && instruction.operands.length < 1) {
			throw new AssemblerError("{name} expects at least 1 operand");
		} else if (num_operands !== null && num_operands != instruction.operands.length) {
			throw new AssemblerError("{name} expects " + num_operands + " operand(s)");
		}

		// process pseudo-instructions
		if ((instruction.name == "ORIG" || instruction.name == "EQU" || instruction.name == "WORD" || instruction.name == "TAB") && instruction.operands[0].type != assembly.OPRD_TYPE_IMMEDIATE) {
			throw new AssemblerError("Invalid operand for {name} (expects constant)");
		}

		if ((instruction.name == "ORIG" || instruction.name == "EQU") && typeof instruction.operands[0].w == "string") {
			throw new AssemblerError("Invalid operand for {name} (cannot be a label)");
		}

		switch (instruction.name) {
			case "ORIG":
				writer.setPosition(instruction.operands[0].w);
				continue;
			case "EQU":
				set_label(instruction.label, instruction.operands[0].w);
				continue;
			case "WORD":
				set_label(instruction.label, writer.getPosition());
				writer.movePosition(1);
				continue;
			case "STR":
				set_label(instruction.label, writer.getPosition());
				instruction.operands.forEach(function(o) {
					if (o.type == assembly.OPRD_TYPE_STRING) {
						writer.movePosition(o.w.length);
					} else if (o.type == assembly.OPRD_TYPE_IMMEDIATE) {
						writer.movePosition(1);
					} else {
						throw new AssemblerError("Invalid operand for STR");
					}
				});
				continue;
			case "TAB":
				set_label(instruction.label, writer.getPosition());
				writer.movePosition(instruction.operands[0].w);
				continue;
		}

		if (instruction.label) {
			set_label(instruction.label, writer.getPosition());
		}

		// process instructions
		var operand_0 = instruction.operands[0];
		var operand_1 = instruction.operands[1];

		switch (instruction.getType()) {
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
		var instruction = data[i];
		AssemblerError.prepare(instruction, result);
		// no need to recheck number of operands

		// process pseudo-instructions
		result.pseudoCount++;
		switch (instruction.name) {
			case "ORIG":
				writer.setPosition(instruction.operands[0].w);
				continue;
			case "EQU":
				// done on first pass
				continue;
			case "WORD":
				writer.write(get_w(instruction.operands[0]), 2);
				continue;
			case "STR":
				instruction.operands.forEach(function(o) {
					if (o.type == assembly.OPRD_TYPE_STRING) {
						for (var j = 0, l = o.w.length; j < l; j++) {
							writer.write(o.w.charCodeAt(j), 3);
						}
					} else if (o.type == assembly.OPRD_TYPE_IMMEDIATE) {
						writer.write(get_w(o), 3);
					} else {
						throw new AssemblerError("Invalid operand for STR");
					}
				});
				continue;
			case "TAB":
				for (var j = 0; j < get_w(instruction.operands[0]); j++) {
					writer.write(0, 4);
				}
				continue;
		}
		result.pseudoCount--; // smart way to count pseudo instructions

		// check if the labels are correctly placed
		if (instruction.label) {
			if (labels[instruction.label] === undefined || labels[instruction.label] != writer.getPosition()) {
				// should not happen
				throw "Internal Error: first pass failed";
			}
		}

		// process instructions
		var operand_0 = instruction.operands[0];
		var operand_1 = instruction.operands[1];

		result.instructionCount++;
		switch (instruction.getType()) {
			case "0":
				writer.writeInstZero(instruction.getOpcode());
				break;
			case "0c":
				if (operand_0.type != assembly.OPRD_TYPE_IMMEDIATE) {
					throw new AssemblerError("Operand must be immediate");
				}
				var w = get_w(operand_0);
				if (w < 0 || w > 1023) {
					throw new AssemblerError("Constant must be between 0 and 1023");
				}
				writer.writeInstConstant(instruction.getOpcode(), w);
				break;
			case "1":
			case "j":
				var m = get_m(operand_0);
				var r = get_r(operand_0);
				var w = get_w(operand_0);
				writer.writeInstOne(instruction.getOpcode(), m, r, w);
				break;
			case "1c":
				var m = get_m(operand_0);
				if (operand_1.type != assembly.OPRD_TYPE_IMMEDIATE) {
					throw new AssemblerError("Second operand must be a constant");
				}
				var c = get_w(operand_1);
				if (c < 0 || c > 15) {
					throw new AssemblerError("Constant must be between 0 and 15");
				}
				var r = get_r(operand_0);
				var w = get_w(operand_0);
				writer.writeInstOneC(instruction.getOpcode(), c, m, r, w);
				break;
			case "2":
				if (operand_0.type == assembly.OPRD_TYPE_IMMEDIATE) {
					throw new AssemblerError("First operand cannot be immediate");
				}
				var s, reg, other_operand;
				if (operand_0.type == assembly.OPRD_TYPE_REGISTER) {
					s = 1;
					reg = operand_0.r;
					other_operand = operand_1;
				} else if (operand_1.type == assembly.OPRD_TYPE_REGISTER) {
					s = 0;
					reg = operand_1.r;
					other_operand = operand_0;
				} else {
					throw new AssemblerError("One of the operands must be a register");
				}
				var m = get_m(other_operand);
				var r = get_r(other_operand);
				var w = get_w(other_operand);
				writer.writeInstTwo(instruction.getOpcode(), s, reg, m, r, w);
				break;
			case "jc":
				var m = get_m(operand_0);
				var c = instruction.getConditionCode();
				var r = get_r(operand_0);
				var w = get_w(operand_0);
				writer.writeJumpC(instruction.getOpcode(), c, m, r, w);
				break;
			case "jr":
			case "jrc":
				if (operand_0.type != assembly.OPRD_TYPE_IMMEDIATE) {
					throw new AssemblerError("Invalid operand for {name}");
				}
				var d = get_w(operand_0) - writer.getPosition() - 1;
				if (d < -32 || d > 31) {
					throw new AssemblerError("Target too far for branch jump");
				}
				if (instruction.getType() == "jr") {
					writer.writeJumpR(instruction.getOpcode(), d);
				} else {
					var c = instruction.getConditionCode();
					writer.writeJumpRC(instruction.getOpcode(), c, d);
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
					throw e + ", on line " + instruction.debug.line;
				}
			}
		}
	}

	AssemblerError.clear();
	return result;
};
