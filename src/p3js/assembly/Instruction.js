var assembly = require("./");

var Instruction = module.exports = function(useDebug) {
	this.debug = (useDebug ? { text: null, line: null, addr: 0 } : null);
	this.label = null;
	this.name = "nop";
	this.condition = null;
	this.operands = [];
}

Instruction.prototype.isPseudoInstruction = function() {
	return !!assembly.pseudoInstructions[this.name];
}

Instruction.prototype.isInstruction = function() {
	return !!assembly.instructions[this.name];
}

Instruction.prototype.requiresLabel = function() {
	if (this.isPseudoInstruction()) {
		return assembly.pseudoInstructions[this.name].requiresLabel;
	}
	return false;
}

Instruction.prototype.getOpcode = function() {
	return (this.isInstruction() ? assembly.instructions[this.name].opcode : null);
}

Instruction.prototype.getType = function() {
	if (this.isPseudoInstruction()) {
		return assembly.pseudoInstructions[this.name].type;
	} else if (this.isInstruction()) {
		return assembly.instructions[this.name].type;
	}
	return null;
}

Instruction.prototype.getConditionCode = function() {
	var c = assembly.conditions[this.condition];
	return (c === undefined ? null : c);
}

Instruction.prototype.getNumOperands = function() {
	return assembly.getNumOperands(this.getType());
}
