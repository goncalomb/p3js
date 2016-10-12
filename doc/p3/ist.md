# P3 CPU at IST #

At IST, the P3 is studied in a simulated environment or implemented on an FPGA.

The I/O devices are based on the (now retired) Digilent DIO5 Peripheral Board. They can also be simulated on the p3js and other simulators.

There are 256 addresses reserved for I/O devices (0xFF00 to 0xFFFF), only 15 are used.

## I/O Devices ##

_There are no I/O devices before 0xFFF0. 0xFFFB is also not connected._

Address | Direction | Device | Description
--------|-----------|--------|------------
0xFFF0 | write | 7 segment display 1 | Controls for the first digit of the 7 segment display (lower 4 bits)
0xFFF1 | write | 7 segment display 2 | Controls for the second digit of the 7 segment display (lower 4 bits)
0xFFF2 | write | 7 segment display 3 | Controls for the third digit of the 7 segment display (lower 4 bits)
0xFFF3 | write | 7 segment display 4 | Controls for the fourth digit of the 7 segment display (lower 4 bits)
0xFFF4 | write | LCD (control) | Write control data to the LCD
0xFFF5 | write | LCD (data) | Write ASCII character to the LCD
0xFFF6 | read/write | Timer (value) | Timer value
0xFFF7 | read/write | Timer (status) | Timer start/stop
0xFFF8 | write | LEDs | Controls the 16 LEDs
0xFFF9 | read | Switches | Read the 8 switches (lower 8 bits)
0xFFFA | read/write | Interrupt Mask | Interrupt mask for the first 16 interrupt vectors
0xFFFB | | _Not Connected_ |
0xFFFC | write | Terminal (cursor) | Controls the position of the cursor
0xFFFD | read | Terminal (status) | Test for pending characters on the terminal
0xFFFE | write | Terminal (write) | Write ASCII character to the terminal
0xFFFF | read | Terminal (read) | Read ASCII character from the terminal
