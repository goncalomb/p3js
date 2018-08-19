export class AssemblerError {
  constructor(message, line) {
    this.message = message;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.line = line || null;
    this.instruction = this.constructor._instruction;
    this.result = this.constructor._result;
    if (this.instruction) {
      this.message = this.message.replace('{name}', this.instruction.name);
      if (this.instruction.debug && this.line === null) {
        this.line = this.instruction.debug.line;
      }
    }
  }

  static prepare(instruction, result) {
    this._instruction = instruction;
    this._result = result;
  }

  static clear() {
    this.prepare(null, null);
  }

  getFullMessage() {
    if (this.line) {
      return this.message + ', on line ' + this.line;
    }
    return this.message;
  }

  toString() {
    return 'AssemblerError: ' + this.message;
  }
}

AssemblerError._instruction = null;
AssemblerError._result = null;
