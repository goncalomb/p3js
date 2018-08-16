/* eslint-disable no-multi-spaces */

import * as assembler from './assembler.js';
import * as parser from './parser.js';

export const REGISTER_0 = 0;
export const REGISTER_SP = 14;
export const REGISTER_PC = 15;

export const OPRD_TYPE_STRING = -1;           // 'Test String'
export const OPRD_TYPE_REGISTER = 0;          // Rx
export const OPRD_TYPE_REGISTER_INDIRECT = 1; // M[Rx]
export const OPRD_TYPE_IMMEDIATE = 2;         // W
export const OPRD_TYPE_DIRECT = 3;            // M[W]
export const OPRD_TYPE_INDEXED = 4;           // M[Rx+W]
export const OPRD_TYPE_RELATIVE = 5;          // M[PC+W]
export const OPRD_TYPE_BASED = 6;             // M[SP+W]
export const OPRD_TYPE_PC = 7;                // PC
export const OPRD_TYPE_SP = 8;                // SP

export const INST_TYPE_ZERO = '0';            // zero operands
export const INST_TYPE_ZERO_CONST = '0c';     // zero operands with constant
export const INST_TYPE_ONE = '1';             // one operand
export const INST_TYPE_ONE_CONST = '1c';      // one operand with constant
export const INST_TYPE_TWO = '2';             // two operands
export const INST_TYPE_JUMP = 'j';            // absolute jump
export const INST_TYPE_JUMP_COND = 'jc';      // conditional absolute jump
export const INST_TYPE_JUMP_REL = 'jr';       // relative jump
export const INST_TYPE_JUMP_REL_COND = 'jrc'; // conditional relative jump

export const pseudoInstructions = {
  ORIG: { type: "0c", requiresLabel: false },
  EQU: { type: "0c", requiresLabel: true },
  WORD: { type: "0c", requiresLabel: true },
  STR: { type: "s", requiresLabel: true },
  TAB: { type: "0c", requiresLabel: true },
};

export const instructions = {};

export function registerInstruction(name, opcode, type) {
  instructions[name.toUpperCase()] = { opcode, type };
}

export function resetInstructions() {
  [
    // Name   Opcode    Type
    // 0 operands
    ['NOP',   0b000000, INST_TYPE_ZERO],
    ['ENI',   0b000001, INST_TYPE_ZERO],
    ['DSI',   0b000010, INST_TYPE_ZERO],
    ['STC',   0b000011, INST_TYPE_ZERO],
    ['CLC',   0b000100, INST_TYPE_ZERO],
    ['CMC',   0b000101, INST_TYPE_ZERO],
    ['RET',   0b000110, INST_TYPE_ZERO],
    ['RTI',   0b000111, INST_TYPE_ZERO],
    // 0 operands with constant
    ['INT',   0b001000, INST_TYPE_ZERO_CONST],
    ['RETN',  0b001001, INST_TYPE_ZERO_CONST],
    // 1 operand
    ['NEG',   0b010000, INST_TYPE_ONE],
    ['INC',   0b010001, INST_TYPE_ONE],
    ['DEC',   0b010010, INST_TYPE_ONE],
    ['COM',   0b010011, INST_TYPE_ONE],
    ['PUSH',  0b010100, INST_TYPE_ONE],
    ['POP',   0b010101, INST_TYPE_ONE],
    // 1 operand with constant
    ['SHR',   0b011000, INST_TYPE_ONE_CONST],
    ['SHL',   0b011001, INST_TYPE_ONE_CONST],
    ['SHRA',  0b011010, INST_TYPE_ONE_CONST],
    ['SHLA',  0b011011, INST_TYPE_ONE_CONST],
    ['ROR',   0b011100, INST_TYPE_ONE_CONST],
    ['ROL',   0b011101, INST_TYPE_ONE_CONST],
    ['RORC',  0b011110, INST_TYPE_ONE_CONST],
    ['ROLC',  0b011111, INST_TYPE_ONE_CONST],
    // 2 operands
    ['CMP',   0b100000, INST_TYPE_TWO],
    ['ADD',   0b100001, INST_TYPE_TWO],
    ['ADDC',  0b100010, INST_TYPE_TWO],
    ['SUB',   0b100011, INST_TYPE_TWO],
    ['SUBB',  0b100100, INST_TYPE_TWO],
    ['MUL',   0b100101, INST_TYPE_TWO],
    ['DIV',   0b100110, INST_TYPE_TWO],
    ['TEST',  0b100111, INST_TYPE_TWO],
    ['AND',   0b101000, INST_TYPE_TWO],
    ['OR',    0b101001, INST_TYPE_TWO],
    ['XOR',   0b101010, INST_TYPE_TWO],
    ['MOV',   0b101011, INST_TYPE_TWO],
    ['MVBH',  0b101100, INST_TYPE_TWO],
    ['MVBL',  0b101101, INST_TYPE_TWO],
    ['XCH',   0b101110, INST_TYPE_TWO],
    // jump
    ['JMP',   0b110000, INST_TYPE_JUMP],
    ['CALL',  0b110010, INST_TYPE_JUMP],
    // jump conditional
    ['JMP.',  0b110001, INST_TYPE_JUMP_COND],
    ['CALL.', 0b110011, INST_TYPE_JUMP_COND],
    // jump relative
    ['BR',    0b111000, INST_TYPE_JUMP_REL],
    // jump relative conditional
    ['BR.',   0b111001, INST_TYPE_JUMP_REL_COND],
  ].forEach(props => registerInstruction(...props));
}

resetInstructions();

export const conditions = {
  Z: 0,
  NZ: 1,
  C: 2,
  NC: 3,
  N: 4,
  NN: 5,
  O: 6,
  NO: 7,
  P: 8,
  NP: 9,
  I: 10,
  NI: 11,
};

export function getNumOperands(type) {
  if (type == "0") return 0;
  if (type == "0c") return 1;
  if (type == "1") return 1;
  if (type == "1c") return 2;
  if (type == "2") return 2;
  if (type.charAt(0) == "j") return 1;
  return null;
}

export * from './AssemblerError.js';
export * from './AssemblerResult.js';
export * from './Instruction.js';
export * from './ObjectCodeWriter.js';
export { assembler, parser };

export function clearInstructions() {
  Object.keys(instructions).forEach((name) => {
    delete instructions[name];
  });
}

export function dumpInstructionsList() {
  let instNameMap = {};
  Object.keys(this).forEach((prop) => {
    if (prop.startsWith('INST_TYPE')) {
      instNameMap[this[prop]] = prop.substr(10);
    }
  });
  let text = [];
  let longestName = 0;
  Object.keys(instructions).forEach((name) => {
    if (name.length > longestName) {
      longestName = name.length;
    }
  });
  Object.keys(instructions).forEach((name) => {
    let { opcode, type } = instructions[name];
    name += ' '.repeat(longestName - name.length);
    opcode = opcode.toString(2);
    opcode = '0'.repeat(6 - opcode.length) + opcode;
    type = instNameMap[type];
    text.push(`${name} ${opcode} ${type}`);
  });
  return text.join('\n');
}

export function registerInstructionList(text) {
  let newInstructions = {};
  let regex = /^([A-Z]+\.?)\s+([01]{6})\s+([A-Z_]+)(?:\s*#|$)/;
  let lines = text.split('\n');
  for (let i = 0, l = lines.length; i < l; i++) {
    let line = lines[i].trim();
    if (line.length == 0 || line[0] == "#") continue;
    let matches = line.match(regex);
    if (matches) {
      let type = 'INST_TYPE_' + matches[3];
      if (this[type] !== undefined) {
        if (newInstructions[matches[1]] === undefined) {
          newInstructions[matches[1]] = { opcode: parseInt(matches[2], 2), type: this[type] };
        } else {
          throw new Error("Duplicate instruction '" + matches[1] + "', on line " + (i + 1));
        }
      } else {
        throw new Error("Invalid type '" + type + "', on line " + (i + 1));
      }
    } else {
      throw new Error("Syntax error, on line " + (i + 1));
    }
  }
  clearInstructions();
  Object.assign(instructions, newInstructions);
}

export function assembleWithDefaultValidator(text) {
  let data = parser.parseString(text);
  return assembler.assembleData(data, assembler.DEFAULT_VALIDATOR);
}
