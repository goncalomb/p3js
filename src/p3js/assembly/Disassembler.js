import * as assembly from './';

export class Disassembler {
  constructor(simulator) {
    this._simulator = simulator;
  }

  formatRegister(r) {
    switch (r) {
      case assembly.REGISTER_SP: return 'SP';
      case assembly.REGISTER_PC: return 'SP';
      default: return 'R' + r;
    }
  }

  disassembleMemoryArea(address, length) {
    let valueNextIsW = false; // marks the next address as a constant, not a instruction
    // decode the main operand
    let getOperand = (value, valueNext) => {
      let r = value & 0x0f;
      let m = (value >> 4) & 0x03;
      valueNextIsW = (m === 2 || m === 3);
      switch (m) {
        case 0: return this.formatRegister(r);
        case 1: return 'M[' + this.formatRegister(r) + ']';
        case 2: return valueNext.toString(16).padStart(4, '0') + 'h';
        case 3: return 'M[' + this.formatRegister(r) + '+' + valueNext.toString(16).padStart(4, '0') + 'h]';
      }
    };
    // decodes instructions with 2 operands
    let getTwoOperands = (value, valueNext) => {
      let s = (value >> 9) & 0x01;
      let r = (value >> 6) & 0x07;
      if (s) {
        return this.formatRegister(r) + ', ' + getOperand(value, valueNext);
      } else {
        return getOperand(value, valueNext) + ', ' + this.formatRegister(r);
      }
    };

    let result = [];

    // instructions by opcode
    let opcodes = {};
    Object.keys(assembly.instructions).forEach((name) => {
      let inst = assembly.instructions[name];
      opcodes[inst.opcode] = inst;
    });
    // conditions by binary code
    let conditions = {};
    Object.keys(assembly.conditions).forEach((cond, value) => {
      conditions[value] = cond;
    });

    let value = this._simulator._ram.readFromAddress(address) & 0xffff;
    let valueNext;
    for (let addr = address, i = 0; i < length; addr++, i++) {
      valueNext = this._simulator._ram.readFromAddress((addr + 1) & 0xffff) & 0xffff;
      let opcode = (value >> 10) & 0x3f;
      if (!valueNextIsW && typeof opcodes[opcode] !== 'undefined') {
        let name = opcodes[opcode].name;
        let c;
        let d;
        // decode instruction by type
        switch (opcodes[opcode].type) {
          case assembly.INST_TYPE_ZERO:
            result.push(name);
            break;
          case assembly.INST_TYPE_ZERO_CONST:
            c = value & 0x3ff;
            result.push(name + ' ' + c);
            break;
          case assembly.INST_TYPE_ONE:
            result.push(name + ' ' + getOperand(value, valueNext));
            break;
          case assembly.INST_TYPE_ONE_CONST:
            c = (value >> 6) & 0x0f;
            result.push(name + ' ' + getOperand(value, valueNext) + ', ' + c);
            break;
          case assembly.INST_TYPE_TWO:
            result.push(name + ' ' + getTwoOperands(value, valueNext));
            break;
          case assembly.INST_TYPE_JUMP:
            result.push(name + ' ' + getOperand(value, valueNext));
            break;
          case assembly.INST_TYPE_JUMP_COND:
            c = (value >> 6) & 0x0f;
            result.push(name + conditions[c] + ' ' + getOperand(value, valueNext));
            break;
          case assembly.INST_TYPE_JUMP_REL:
            d = (value & 0x3f) << 26 >> 26; // expand sign bit
            d = (addr + d + 1) & 0xffff;
            result.push(name + ' ' + d.toString(16).padStart(4, '0') + 'h');
            break;
          case assembly.INST_TYPE_JUMP_REL_COND:
            c = (value >> 6) & 0x0f;
            d = (value & 0x3f) << 26 >> 26; // expand sign bit
            d = (addr + d + 1) & 0xffff;
            result.push(name + conditions[c] + ' ' + d.toString(16).padStart(4, '0') + 'h');
            break;
        }
      } else {
        result.push('[' + value.toString(16).padStart(4, '0') + 'h]');
        valueNextIsW = false;
      }
      value = valueNext;
    }
    return result;
  }
}
