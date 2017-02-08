# P3 CPU Assembly Format #

The P3 has 7 general purpose registers, R0-R7 (R0 is always 0x0000, cannot be changed).

Two more registers are available to the programmer, SP (stack pointer) and PC (program counter).

## Addressing Modes ##

| Code       | Name              | Operand
| ---------- | ----------------- | -------
| Rx, PC, SP | Register          | A register.
| M[Rx]      | Register Indirect | A position in memory addressed by a register.
| W          | Immediate         | A 16-bit constant.
| M[W]       | Direct            | A position in memory addressed by a 16-bit constant.
| M[Rx+W]    | Indexed           | A position in memory addressed by a register and a 16-bit constant.
| M[PC+W]    | PC-Relative       | A position in memory addressed by PC and a 16-bit constant.
| M[SP+W]    | SP-Relative       | A position in memory addressed by SP and a 16-bit constant.

## Instructions ##

| Operands | Description
| -------- | -----------
| op, opX  | Operand
| c4       | Constant 4-bit
| c6       | Constant 6-bit
| c10      | Constant 10-bit

| Instruction | Operands | Flags | Action
| ----------- | -------- | ----- | ------
| NOP         | _none_   |       | No operation.
| ENI         | _none_   | E     | Enable interrupts.
| DSI         | _none_   | E     | Disable interrupts.
| STC         | _none_   | C     | Set the carry flag to 1.
| CLC         | _none_   | C     | Set the carry flag to 0.
| CMC         | _none_   | C     | Invert the carry flag.
| RET         | _none_   |       | Return from a routine.
| RTI         | _none_   | EZCNO | Return from an interrupt routine.
| INT         | c10      | EZCNO | Trigger interrupt with interrupt vector _c10_, regardless of the E flag.
| RETN        | c10      |       | Return from a routine and free _c10_. positions from the stack.
| NEG         | op       | ZCNO  | Invert the sign of _op_.
| INC         | op       | ZCNO  | Increment _op_.
| DEC         | op       | ZCNO  | Decrement _op_.
| COM         | op       | ZN    | Bitwise NOT, complement (_op = !op_).
| PUSH        | op       |       | Push _op_ to the top of the stack.
| POP         | op       |       | Pop the top of the stack to _op_.
| SHR         | op, c4   | ZCN   | Shift right _op_ by _c4_ bits.
| SHL         | op, c4   | ZCN   | Shift left _op_ by _c4_ bits.
| SHRA        | op, c4   | ZCNO  | Arithmetic shift right, same as SHR but sets the _overflow flag_.
| SHLA        | op, c4   | ZCNO  | Arithmetic shift left, same as SHL but sets the _overflow flag_.
| ROR         | op, c4   | ZCN   | Rotate right _op_ by _c4_ bits.
| ROL         | op, c4   | ZCN   | Rotate left _op_ by _c4_ bits.
| RORC        | op, c4   | ZCN   | Rotate right (with carry) _op_ by _c4_ bits.
| ROLC        | op, c4   | ZCN   | Rotate left (with carry) _op_ by _c4_ bits.
| CMP         | op0, op1 | ZCNO  | Compare _op0_ and _op1_ (same as SUB without changing any operands).
| ADD         | op0, op1 | ZCNO  | Add _op0_ and _op1_ (_op0 = op0 + op1_).
| ADDC        | op0, op1 | ZCNO  | Add _op0_, _op1_ and the carry flag (_op0 = op0 + op1 + C_).
| SUB         | op0, op1 | ZCNO  | Subtract _op0_ and _op1_ (_op0 = op0 - op1_).
| SUBB        | op0, op1 | ZCNO  | Subtract _op0_, _op1_ and the carry flag (_op0 = op0 - op1 - C_).
| MUL         | op0, op1 | ZCNO  | Multiply (no sign) _op0_ by _op1_, both operands are used to store the result (_op0 &#124; op1 = op0 * op1_).
| DIV         | op0, op1 | ZCNO  | Divide (no sign) _op0_ by _op1_, both operands are used to store the result (_op0_ = result; _op1_ = remainder).
| TEST        | op0, op1 | ZN    | Test _op0_ and _op1_ (same as AND without changing any operands).
| AND         | op0, op1 | ZN    | Bitwise AND (_op0 = op0 &and; op1_).
| OR          | op0, op1 | ZN    | Bitwise OR (_op0 = op0 &or; op1_).
| XOR         | op0, op1 | ZN    | Bitwise XOR (_op0 = op0 &oplus; op1_).
| MOV         | op0, op1 |       | Copy _op1_ to _op0_ (_op1 = op0_).
| MVBH        | op0, op1 |       | Copy higher byte of _op1_ to the higher byte of _op0_ (_op0 = (op0 and 0x00ff) or (op1 and 0x00ff)_).
| MVBL        | op0, op1 |       | Copy lower byte of _op1_ to the lower byte of _op0_ (_op0 = (op0 and 0xff00) or (op1 and 0xff00)_).
| XCH         | op0, op1 |       | Exchange _op0_ and _op1_ (_op0_ = _op1_; _op1_ = _op0_)
| JMP         | op       |       | Unconditional jump to _op_.
| JMP._cond_  | op       |       | Jump to _op_ based on condition _cond_.
| CALL        | op       |       | Unconditional routine call to _op_.
| CALL._cond_ | op       |       | Routine call to _op_ based on condition _cond_.
| BR          | c6       |       | Unconditional branch jump to PC + _c6_.
| BR._cond_   | c6       |       | Branch jump to PC + _c6_ based on condition _cond_.
