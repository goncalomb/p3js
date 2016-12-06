;===============================================================================
;
;       Elementary Cellular Automaton (Rule 110)
;
;       2016 Gonçalo Baltazar <me@goncalomb.com>
;       I place this code in the public domain.
;       https://creativecommons.org/publicdomain/zero/1.0/
;
;       Simulates a one-dimensional cellular automaton and prints the
;       result on the terminal. By default it uses Rule 110.
;
;       https://en.wikipedia.org/wiki/Elementary_cellular_automaton
;
;===============================================================================

TERM_WRITE      EQU     fffeh
SP_ADDRESS      EQU     fdffh

RULE            EQU     110             ; change this to use other rules (0-255)

SYMBOL_DEAD     EQU     ' '
SYMBOL_ALIVE    EQU     '#'

;============== Data Region (starting at address 8000h) ========================

                ORIG    8000h

                ; two buffers to hold the old and the new generation
                ; uses two extra words as padding on each side
                ; data starts at index 1

BUF0            TAB     82
BUF1            TAB     82

;============== Code Region (starting at address 0000h) ========================

                ORIG    0000h

                ; set stack pointer

                MOV     R1, SP_ADDRESS
                MOV     SP, R1

                ; load buffers pointers (R6, R7)

                MOV     R6, BUF0
                INC     R6              ; skip padding
                MOV     R7, BUF1
                INC     R7              ; skip padding

                ; set inital conditions

                MOV     R1, 1
                MOV     M[R6+79], R1    ; set last cell (79) as "alive"

                ; jump to main code

                JMP     Main

;-------------- Routines -------------------------------------------------------

                ; routine to print a buffer (pointer on stack)

PrintBuf:       PUSH    R1
                PUSH    R2
                PUSH    R3
                MOV     R1, M[SP+5]
                MOV     R2, 80
PrintBuf0:      MOV     R3, SYMBOL_DEAD
                CMP     M[R1], R0
                BR.Z    PrintBuf1
                MOV     R3, SYMBOL_ALIVE
PrintBuf1:      MOV     M[TERM_WRITE], R3
                INC     R1
                DEC     R2
                BR.NZ   PrintBuf0
                POP     R3
                POP     R2
                POP     R1
                RETN    1

;-------------- Main Program ---------------------------------------------------

Main:           PUSH    R6
                CALL    PrintBuf        ; print the initial state

GenLoop:        MOV     R1, R6
                MOV     R2, R7
                MOV     R3, 80

CellLoop:       MOV     R4, M[R1-1]     ; find current state of the cell
                SHL     R4, 1           ; and its two neighbors
                OR      R4, M[R1]
                SHL     R4, 1
                OR      R4, M[R1+1]

                MOV     R5, RULE        ; calculate new state
                CMP     R4, 0
                BR.Z    RuleLoop1
RuleLoop0:      SHR     R5, 1
                DEC     R4
                BR.NZ   RuleLoop0
RuleLoop1:      AND     R5, 1

                MOV     M[R2], R5       ; set new state

                INC     R1
                INC     R2
                DEC     R3
                JMP.NZ  CellLoop        ; process next cell

                PUSH    R7
                CALL    PrintBuf        ; print the new state

                XCH     R6, R7          ; swap buffers (R6 <-> R7)

                JMP     GenLoop         ; process next generation

;===============================================================================
