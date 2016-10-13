# P3 CPU Technical Description #

The P3 is a 16-bit CPU with 16-bit address and data bus.

## Registers ##

The P3 has 8 general purpose registers, R0-R7. (R0 is always 0x0000, cannot be changed).

Two more registers are available to the programmer, SP (stack pointer) and PC (program counter).

## Opcodes ##

The opcodes are 6-bit long.

|          | x000  | x001  | x010  | x011  | x100  | x101  | x110  | x111  |
|----------|-------|-------|-------|-------|-------|-------|-------|-------|
| **000x** | NOP   | ENI   | DSI   | STC   | CLC   | CMC   | RET   | RTI   |
| **001x** | INT   | RETN  |       |       |       |       |       |       |
| **010x** | NEG   | INC   | DEC   | COM   | PUSH  | POP   |       |       |
| **011x** | SHR   | SHL   | SHRA  | SHLA  | ROR   | ROL   | RORC  | ROLC  |
| **100x** | CMP   | ADD   | ADDC  | SUB   | SUBB  | MUL   | DIV   | TEST  |
| **101x** | AND   | OR    | XOR   | MOV   | MVBH  | MVBL  | XCH   |       |
| **110x** | JMP   | CALL  | JMP.  | CALL. |       |       |       |       |
| **111x** | BR    | BR.   |       |       |       |       |       |       |

## Interrupts ##

The P3 has only one external interrupt signal (INT). It uses "interrupt acknowledge" to handle interrupts, the interrupt number is read from the data bus (lower 8 bits, 256 interrupts). Check the book for more information.

## Memory ##

With a 16-bit address bus, the P3 can directly access 64K 16-bit words of memory.

Addresses from 0xFE00 to 0xFEFF are reserved for the interrupt vector table.

Addresses from 0xFF00 to 0xFFFF are reserved for memory mapped I/O devices.
