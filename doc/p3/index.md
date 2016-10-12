# P3 CPU #

The P3 is a 16 bit CPU used at Instituto Superior Técnico (IST) as a learning tool for Computer Engineering students.

It is described in chapters 10, 11 and 12 of the book:

> Arquitectura de Computadores: Dos Sistemas Digitais aos Microprocessadores  
> G. Arroz, J. Monteiro, A. Oliveira  
> IST Press

The P3 itself is not a commercial product and doesn't exist as a dedicated IC. It is normally implemented on an FPGA or simulated on a computer.

_Not to be confused with The Pentium III._

## Specifications ##

* 16-bit architecture (16-bit address and data bus)
* CISC design
* 8 general purpose registers (1 always 0x0000)
* 45 instructions (default)
* 4 addressing modes
* 1 interrupt signal

## Some Considerations ##

The P3 uses "interrupt acknowledge" to handle interrupts. The interrupt number is read from the data bus (lower 8 bits, 256 interrupts). Check the book for more information.

Addresses from 0xFE00 to 0xFEFF are reserved for the interrupt vector table.

Addresses from 0xFF00 to 0xFFFF are reserved for memory mapped I/O devices.

On boot, the CPU starts executing instructions at 0x0000.
