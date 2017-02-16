; Write some assembly code here.
; Then click 'Assemble and Run' to run it on the P3 simulator.
; Comments start with ';'.

; For more information check 'About P3JS'.



; ------------- ;
; Try the Demos ----->  ----->  ----->  ----->  ----->  ----->  ----->  ----->
; ------------- ;



; This is a simple program that counts to ffffh and shows the result in binary
; on the LEDS.

; Click 'Assemble and Run' then check the tab 'Input/Output'.


LEDS            EQU     fff8h           ; constant with the I/O address to
                                        ; control the LEDS

                ORIG    0000h           ; indication that we want to put the
                                        ; code at position 0000h

                ; the CPU starts running code at the address 0000h
                ; the first instruction is to jump to the Main code

                JMP     Main            ; jump to the Main code

                ; this next code is a simple delay routine
                ; uses R7 to count to 0000h then returns, this is not the ideal
                ; way to make delays, you should use the timer and interrupts

Delay:          MOV     R7, f000h       ; initialize R7 with f000h
DelayInc:       INC     R7              ; increment R7
                BR.NZ   DelayInc        ; if R7 is not 0000h, jump to DelayInc
                RET                     ; else return from the routine

                ; the Main code starts here

Main:           MOV     R1, R0          ; initialize R1 with 0 (R0 is always 0)
Loop:           INC     R1              ; increment R1
                MOV     M[LEDS], R1     ; write the value of R1 to the LEDS
                CALL    Delay           ; call the Delay routine
                BR      Loop            ; branch jump back to Loop
