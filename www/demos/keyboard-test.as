;===============================================================================
;
;       Keyboard Input Test
;
;       2016 Gonçalo Baltazar <me@goncalomb.com>
;       I place this code in the public domain.
;       https://creativecommons.org/publicdomain/zero/1.0/
;
;       Test for keyboard input on the terminal.
;
;===============================================================================

TERM_STATE      EQU     fffdh
TERM_WRITE      EQU     fffeh
TERM_READ       EQU     ffffh

;============== Code Region (starting at address 0000h) ========================

                ORIG    0000h

;-------------- Main Program ---------------------------------------------------

                MOV     R1, 0

LoopASCII:      MOV     R2, R1
                CMP     R1, 10
                BR.NZ   WriteChar
                MOV     R2, 0
WriteChar:      MOV     M[TERM_WRITE], R2

                INC     R1

                MOV     R2, R1
                AND     R2, 000fh
                BR.NZ   TestEnd

                MOV     R2, 10
                MOV     M[TERM_WRITE], R2

TestEnd:        CMP     R1, 256
                BR.NZ   LoopASCII


                MOV     R2, 10
                MOV     M[TERM_WRITE], R2


LoopKeyTest:    CMP     M[TERM_STATE], R0
                BR.Z    LoopKeyTest

                MOV     R1, M[TERM_READ]
                MOV     R2, R1

                MOV     R3, 10000
                DIV     R2, R3
                XCH     R2, R3
                ADD     R3, '0'
                MOV     M[TERM_WRITE], R3

                MOV     R3, 1000
                DIV     R2, R3
                XCH     R2, R3
                ADD     R3, '0'
                MOV     M[TERM_WRITE], R3

                MOV     R3, 100
                DIV     R2, R3
                XCH     R2, R3
                ADD     R3, '0'
                MOV     M[TERM_WRITE], R3

                MOV     R3, 10
                DIV     R2, R3
                XCH     R2, R3
                ADD     R3, '0'
                MOV     M[TERM_WRITE], R3

                ADD     R2, '0'
                MOV     M[TERM_WRITE], R2

                MOV     R2, '('
                MOV     M[TERM_WRITE], R2
                MOV     M[TERM_WRITE], R1
                MOV     R2, ')'
                MOV     M[TERM_WRITE], R2
                MOV     R2, ' '
                MOV     M[TERM_WRITE], R2

                JMP      LoopKeyTest

;===============================================================================
