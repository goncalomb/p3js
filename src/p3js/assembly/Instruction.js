import * as assembly from './';

export class Instruction {
  constructor(useDebug) {
    this.debug = (useDebug ? { text: null, line: null, addr: 0 } : null);
    this.label = null;
    this.name = 'nop';
    this.condition = null;
    this.operands = [];
  }

  isPseudoInstruction() {
    return !!assembly.pseudoInstructions[this.name];
  }

  isInstruction() {
    return !!assembly.instructions[this.name];
  }

  requiresLabel() {
    if (this.isPseudoInstruction()) {
      return assembly.pseudoInstructions[this.name].requiresLabel;
    }
    return false;
  }

  getOpcode() {
    return (this.isInstruction() ? assembly.instructions[this.name].opcode : null);
  }

  getType() {
    if (this.isPseudoInstruction()) {
      return assembly.pseudoInstructions[this.name].type;
    } else if (this.isInstruction()) {
      return assembly.instructions[this.name].type;
    }
    return null;
  }

  getConditionCode() {
    var c = assembly.conditions[this.condition];
    return (c === undefined ? null : c);
  }

  getNumOperands() {
    return assembly.getNumOperands(this.getType());
  }
}
