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
export const OPRD_TYPE_SP = 8;                 // SP

export const pseudoInstructions = {
  "ORIG": { type: "0c", requiresLabel: false },
  "EQU":  { type: "0c", requiresLabel: true  },
  "WORD": { type: "0c", requiresLabel: true  },
  "STR":  { type: "s",  requiresLabel: true  },
  "TAB":  { type: "0c", requiresLabel: true  }
};

//   Name  Opcode   Type
var instructions_raw = [
  // 0 operands
  "NOP   000000   0",
  "ENI   000001   0",
  "DSI   000010   0",
  "STC   000011   0",
  "CLC   000100   0",
  "CMC   000101   0",
  "RET   000110   0",
  "RTI   000111   0",
  // 0 operands with constant
  "INT   001000   0c",
  "RETN  001001   0c",
  // 1 operand
  "NEG   010000   1",
  "INC   010001   1",
  "DEC   010010   1",
  "COM   010011   1",
  "PUSH  010100   1",
  "POP   010101   1",
  // 1 operand with constant
  "SHR   011000   1c",
  "SHL   011001   1c",
  "SHRA  011010   1c",
  "SHLA  011011   1c",
  "ROR   011100   1c",
  "ROL   011101   1c",
  "RORC  011110   1c",
  "ROLC  011111   1c",
  // 2 operands
  "CMP   100000   2",
  "ADD   100001   2",
  "ADDC  100010   2",
  "SUB   100011   2",
  "SUBB  100100   2",
  "MUL   100101   2",
  "DIV   100110   2",
  "TEST  100111   2",
  "AND   101000   2",
  "OR    101001   2",
  "XOR   101010   2",
  "MOV   101011   2",
  "MVBH  101100   2",
  "MVBL  101101   2",
  "XCH   101110   2",
  // jump
  "JMP   110000   j",
  "CALL  110010   j",
  // jump conditional
  "JMP.  110001   jc",
  "CALL. 110011   jc",
  // jump relative
  "BR    111000   jr",
  // jump relative conditional
  "BR.   111001   jrc"
];

export const instructions = { };
for (var i = 0, l = instructions_raw.length; i < l; i++) {
  var parts = instructions_raw[i].replace(/\s+/g, " ").split(" ");
  instructions[parts[0].toUpperCase()] = {
    opcode: parseInt(parts[1], 2),
    type: parts[2]
  };
}

export const conditions = {
  "Z": 0, "NZ": 1, "C": 2, "NC": 3, "N": 4, "NN": 5,
  "O": 6, "NO": 7, "P": 8, "NP": 9, "I": 10, "NI": 11
}

export function getNumOperands(type) {
  if (type == "0")  return 0;
  if (type == "0c") return 1;
  if (type == "1")  return 1;
  if (type == "1c") return 2;
  if (type == "2")  return 2;
  if (type.charAt(0) == "j") return 1;
  return null
};

export * from './AssemblerError.js';
export * from './AssemblerResult.js';
export * from './Instruction.js';
export * from './ObjectCodeWriter.js';

import * as assembler from './assembler.js';
import * as parser from './parser.js';
export { assembler, parser };

export function assembleWithDefaultValidator(text) {
  var data = parser.parseString(text);
  return assembler.assembleData(data, assembler.DEFAULT_VALIDATOR);
}
