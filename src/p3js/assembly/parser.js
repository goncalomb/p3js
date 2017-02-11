/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

var parser = module.exports = { };
var assembly = require("./");

parser.parseConstant = function(text) {
	var match, i = null;
	function tryParseInt(regex, base) {
		if (match = text.match(regex)) {
			i = parseInt(match[1], base);
			if (match[0].charAt(0) == "-") {
				i = -i;
			}
			return true;
		}
		return false;
	}
	if (
		tryParseInt(/^[-+]?([01]{1,16})b$/i,     2) === false && // bin
		tryParseInt(/^[-+]?([0-7]{1,6})o$/i,     8) === false && // oct
		tryParseInt(/^[-+]?([0-9]{1,5})d?$/i,   10) === false && // dec
		tryParseInt(/^[-+]?([0-9a-f]{1,4})h$/i, 16) === false && // hex
		// If everything fails, try parse ASCII constant.
		text.length == 3 && text.charAt(0) == "'" && text.charAt(2) == "'"
	) {
		i = text.charCodeAt(1);
	}
	if (i == null || i < -32768 || i > 65535) {
		return null;
	}
	i = i & 0xffff; // 16 bit unsigned, please
	return i;
}

parser.parseStringConstant = function(text) {
	var str = "";
	var l = text.length;
	if (l > 3 && text.charAt(0) == "'" && text.charAt(l - 1) == "'") {
		for (var i = 1; i < l - 1; i++) {
			if (text.charAt(i) == "'") {
				// found "'" in the middle of string, error
				// XXX: the official assembler doesn't escape "'", it's
				// inpossible to have strings with "'" :(
				// should we escape?
				return null;
			}
			str += text.charAt(i);
		}
		return str;
	}
	return null;
}

parser.isValidLabel = function(value) {
	return !!value.match(/^[a-z_]\w*$/i);
}

function process_constant_or_label(value, sign, n) {
	var w = parser.parseConstant(sign + value);
	if (w === null && parser.isValidLabel(value)) {
		w = value;
	}
	if (w === null) {
		throw "Syntax error, invalid operand constant, on line " + n;
	}
	return w;
}

function process_operand(operand, n) {
	operand = operand.trim();
	if (!operand) {
		throw "Syntax error, invalid operand (empty?), on line " + n;
	}
	var matches;
	if (matches = operand.match(/^R([0-7])$/i)) {
		return { type: assembly.OPRD_TYPE_REGISTER, r: matches[1].charCodeAt(0) - 48 };
	} else if (operand.toUpperCase() == "SP") {
		return { type: assembly.OPRD_TYPE_SP, r: assembly.REGISTER_SP };
	} else if (matches = operand.match(/^\M\s*\[\s*(?:(SP|PC|R[0-7])(?:\s*(\+|\-)\s*([^\s].*?))?|([^\s].*?))\s*\]$/i)) {
		if (matches[4]) {
			var w = process_constant_or_label(matches[4], '', n);
			return { type: assembly.OPRD_TYPE_DIRECT, w: w };
		} else if (matches[1]) {
			var op = { type: assembly.OPRD_TYPE_INDEXED, w: 0 }
			if (matches[1].toUpperCase() == "SP") {
				op.type = assembly.OPRD_TYPE_BASED;
				op.r = assembly.REGISTER_SP;
			} else if (matches[1].toUpperCase() == "PC") {
				op.type = assembly.OPRD_TYPE_RELATIVE;
				op.r = assembly.REGISTER_PC;
			} else {
				op.r = matches[1].charCodeAt(1) - 48;
			}
			if (matches[2]) {
				op.s = matches[2];
				op.w = process_constant_or_label(matches[3], matches[2], n);
			} else if (op.r != assembly.REGISTER_SP) {
				return { type: assembly.OPRD_TYPE_REGISTER_INDIRECT, r: op.r };
			}
			return op;
		}
	} else {
		var w = parser.parseStringConstant(operand);
		if (w) {
			return { type: assembly.OPRD_TYPE_STRING, w: w };
		}
		w = process_constant_or_label(operand, '', n);
		return { type: assembly.OPRD_TYPE_IMMEDIATE, w: w };
	}
	return null;
}

function process_line(text, n) {
	var matches = text.match(/^\s*(?:([a-z_]\w*)(?:\s+|\s*(:)\s*))?([a-z]+)(?:\s*\.\s*([a-z]+))?(?:\s+(.*?)\s*)?$/i);
	// 1: label; 2: colon; 3: instruction; 4: condition; 5: operands;
	if (!matches) {
		throw "Syntax error, on line " + n;
	} else if (!matches[3]) {
		// should not happen
		throw "Internal Error: invalid regex result";
	}

	var instruction = new assembly.Instruction(true);
	instruction.debug.text = text;
	instruction.debug.line = n;

	// process label
	if (matches[1]) {
		var lower = matches[1].toUpperCase();
		if (assembly.pseudoInstructions[lower] || assembly.instructions[lower]) {
			// found label with instruction name, investigate
			if (matches[2] || matches[4] || matches[5]) {
				// dont allow labels with instruction names
				throw "Syntax error, invalid label, on line " + n;
			} else {
				// a simple instruction like 'JMP SomeLabel' will only use match group 1 and 3
				// with these instructions the label match group is the instruction
				// the operators are on the instruction match group
				matches[5] = matches[3];
				matches[3] = matches[1];
				matches[1] = undefined;
			}
		} else {
			instruction.label = matches[1]; // store label
		}
	}

	// process instruction
	instruction.name = matches[3].toUpperCase() + (matches[4] ? "." : ""); // store instruction name
	if (instruction.isInstruction()) {
		if (instruction.label && !matches[2]) {
			throw "Syntax error, invalid label (missing colon?), on line " + n;
		} else if (matches[4]) {
			// conditional instruction
			instruction.condition = matches[4].toUpperCase(); // store condition
			if (instruction.getConditionCode() === null) { // TODO: move this check to the assembler
				throw "Syntax error, invalid condition, on line " + n;
			}
		}
	} else if (instruction.isPseudoInstruction()) {
		if (instruction.requiresLabel()) {
			if (!instruction.label || matches[2]) {
				throw "Syntax error, invalid or missing label, on line " + n;
			}
		} else if (instruction.label) {
			throw "Syntax error, '" + instruction.name + "' cannot have a label, on line " + n;
		}
	} else {
		throw "Syntax error, invalid instruction, on line " + n;
	}

	// process operands
	if (matches[5]) {
		var inside_string = false;
		for (var operand = "", i = 0, l = matches[5].length; i < l; i++) {
			var c = matches[5].charAt(i);
			if (c == "," && !inside_string) {
				instruction.operands.push(process_operand(operand, n));
				operand = "";
			} else {
				if (c == "'") {
					inside_string = !inside_string;
				}
				operand += c;
			}
		}
		instruction.operands.push(process_operand(operand, n));
	}
	return instruction;
}

parser.parseString = function(text) {
	var data = [];
	var n = 1;
	var inside_comment = false;
	var inside_string = false;
	for (var line = "", i = 0, l = text.length; i < l; i++) {
		var c = text.charAt(i);
		if (c == "\n") {
			if (line && line.trim()) {
				data.push(process_line(line, n));
			}
			line = "";
			n++;
			inside_comment = false;
			inside_string = false;
		} else if (inside_comment) {
			// Do nothing!
		} else if (c == ";" && !inside_string) {
			inside_comment = true;
		} else {
			if (c == "'") {
				inside_string = !inside_string;
			}
			line += c;
		}
	}
	if (line && line.trim()) {
		data.push(process_line(line, n));
	}
	return data;
};
