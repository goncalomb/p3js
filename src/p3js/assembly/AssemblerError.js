var AssemblerError = module.exports = function(message, line) {
	this.message = message;
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, this.constructor);
	}
	this.line = line || null;
	this.instruction = this.constructor._instruction;
	this.result = this.constructor._result;
	if (this.instruction) {
		this.message = this.message.replace("{name}", this.instruction.name);
		if (this.instruction.debug && this.line === null) {
			this.line = this.instruction.debug.line;
		}
	}
}

AssemblerError._instruction = null;
AssemblerError._result = null;

AssemblerError.prepare = function(instruction, result) {
	this._instruction = instruction;
	this._result = result;
}

AssemblerError.clear = function() {
	this.prepare(null, null);
}

AssemblerError.prototype.name = "AssemblerError";

AssemblerError.prototype.getFullMessage = function() {
	if (this.line) {
		return this.message + ", on line " + this.line;
	}
	return this.message;
}

AssemblerError.prototype.toString = function() {
	return "AssemblerError: " + this.message;
}
