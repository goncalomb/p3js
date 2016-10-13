# P3 CPU #

The P3 is a 16 bit CPU used at Instituto Superior Técnico (IST) as a learning tool for Computer Engineering students.

It is described in chapters 10, 11 and 12 of the book:

> Arquitectura de Computadores: Dos Sistemas Digitais aos Microprocessadores  
> G. Arroz, J. Monteiro, A. Oliveira  
> IST Press

See [P3 at IST](ist.md) for more information on how the P3 is used at IST.

The P3 itself is not a commercial product and doesn't exist as a dedicated IC. It is normally implemented on an FPGA or simulated on a computer.

_Not to be confused with The Pentium III._

## Specifications ##

* 16-bit architecture (16-bit address and data bus)
* CISC design
* 8 general purpose registers (1 always 0x0000)
* 45 instructions (default)
* 4 addressing modes
* 1 interrupt signal

See [Technical Description](technical.md) for more information.
