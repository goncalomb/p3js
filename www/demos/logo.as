;===============================================================================
;
;       P3CPU Unofficial ASCII Logo
;
;       2017 Gonçalo Baltazar <me@goncalomb.com>
;       I place this code in the public domain.
;       https://creativecommons.org/publicdomain/zero/1.0/
;
;===============================================================================

INT15_TIMER     EQU     fe0fh

TIMER_VALUE     EQU     fff6h
TIMER_CONTROL   EQU     fff7h
INT_MASK        EQU     fffah
TERM_CURSOR     EQU     fffch
TERM_WRITE      EQU     fffeh

SP_ADDRESS      EQU     fdffh
INT_MASK_VALUE  EQU     8000h

;============== Data Region (starting at address 8000h) ========================

                ORIG    8000h

LOGO_00         STR     ' ______________________________________________________________________________ '
LOGO_01         STR     '|    _____________      ____________                                           |'
LOGO_02         STR     '|   /             \    /            \                                          |'
LOGO_03         STR     '|  /\     _____    \  /\_________    \        THE P3 EDUCATIONAL CPU           |'
LOGO_04         STR     '|  \ \    \___ \    \ \/_________\    \           P3JS Simulator               |'
LOGO_05         STR     '|   \ \    \__\_\    \    ________\    \                                       |'
LOGO_06         STR     '|    \ \              \  /\             \     ______    ______    __  __       |'
LOGO_07         STR     '|     \ \     ________/  \ \_________    \   /\  ___\  /\  __ \  /\ \/\ \      |'
LOGO_08         STR     '|      \ \    \______/    \/_________\    \  \ \ \     \ \ \_\ \ \ \ \ \ \     |'
LOGO_09         STR     '|       \ \    \              ________\    \  \ \ \     \ \  ___\ \ \ \ \ \    |'
LOGO_10         STR     '|        \ \    \            /\             \  \ \ \____ \ \ \__/  \ \ \_\ \   |'
LOGO_11         STR     '|         \ \____\           \ \____________/   \ \_____\ \ \_\     \ \_____\  |'
LOGO_12         STR     '|          \/____/            \/___________/     \/_____/  \/_/      \/_____/  |'
LOGO_13         STR     '|______________________________________________________________________________|'
LOGO_14         STR     0000h

STR_0           STR     'Your browser is running a demo simulation of the P3 CPU!',0
STR_1           STR     'Visit https://p3js.goncalomb.com/ for the full simulator and more demos...',0

SPINNER_STR     STR     '|\-/'
SPINNER_VALUE   WORD    0

COUNTER         WORD    0

;============== Code Region (starting at address 0000h) ========================

                ORIG    0000h
                JMP     Main

;-------------- Routines -------------------------------------------------------

                ; interrupt timer routine

Int15Routine:   CALL    DrawSpinner
                CALL    DrawCounter
                CALL    StartTimer
                RTI

                ; routine to start the timer

StartTimer:     PUSH    R1
                MOV     R1, 2
                MOV     M[TIMER_VALUE], R1
                MOV     R1, 1
                MOV     M[TIMER_CONTROL], R1
                POP     R1
                RET

                ; routine to draw the logo

DrawLogo:       PUSH    R1
                PUSH    R2
                PUSH    R3
                MOV     R1, ffffh
                MOV     M[TERM_CURSOR], R1
                MOV     R1, LOGO_00
                MOV     R2, R0

DrawLogoLoop:   MOV     R3, M[R1]
                CMP     R3, R0
                BR.Z    DrawLogoRet
                MOV     M[TERM_CURSOR], R2
                MOV     M[TERM_WRITE], R3

                MOV     R3,  0100h
DrawLogoDelay:  DEC     R3
                BR.NZ   DrawLogoDelay

                INC     R1
                INC     R2

                MOV     R3, R2
                AND     R3, 00ffh
                CMP     R3, 80
                BR.NZ   DrawLogoLoop

                OR      R2, 00ffh
                INC     R2
                BR      DrawLogoLoop

DrawLogoRet:    POP     R3
                POP     R2
                POP     R1
                RET

                ; routine to draw the spinners

DrawSpinner:    PUSH    R1
                PUSH    R2

                MOV     R1, SPINNER_STR
                ADD     R1, M[SPINNER_VALUE]
                MOV     R1, M[R1]

                MOV     R2, 032ch
                MOV     M[TERM_CURSOR], R2
                MOV     M[TERM_WRITE], R1
                ADD     R2, 25
                MOV     M[TERM_CURSOR], R2
                MOV     M[TERM_WRITE], R1

                MOV     R1, M[SPINNER_VALUE]
                INC     R1
                AND     R1, 0003h
                MOV     M[SPINNER_VALUE], R1

                POP     R2
                POP     R1
                RET

                ; routine to draw strings

DrawString:     PUSH    R1
                PUSH    R2
                PUSH    R3
                MOV     R1, M[SP+6]
                MOV     R2, M[SP+5]

DrawStringLoop: MOV     R3, M[R1]
                CMP     R3, R0
                BR.Z    DrawStringRet
                MOV     M[TERM_CURSOR], R2
                MOV     M[TERM_WRITE], R3
                INC     R1
                INC     R2
                BR      DrawStringLoop

DrawStringRet:  POP     R3
                POP     R2
                POP     R1
                RET

                ; routine to draw binary counter

DrawCounter:    PUSH    R1
                PUSH    R2
                PUSH    R3
                PUSH    R4

                MOV     R1, M[COUNTER]
                MOV     R2, 16
                MOV     R3, 1402h

DrawCounterLoop:SHL     R1, 1
                MOV     R4, '0'
                ADDC    R4, R0
                MOV     M[TERM_CURSOR], R3
                MOV     M[TERM_WRITE], R4
                INC     R3
                DEC     R2
                BR.NZ   DrawCounterLoop

                INC     M[COUNTER]
                POP     R4
                POP     R3
                POP     R2
                POP     R1
                RET

;-------------- Main Program ---------------------------------------------------

Main:           MOV     R1, SP_ADDRESS
                MOV     SP, R1

                MOV     R1, Int15Routine
                MOV     M[INT15_TIMER], R1

                MOV     R1, INT_MASK_VALUE
                MOV     M[INT_MASK], R1
                ENI

                CALL    DrawLogo
                CALL    DrawSpinner
                CALL    DrawCounter
                CALL    StartTimer

                PUSH    STR_0
                PUSH    1002h
                CALL    DrawString

                PUSH    STR_1
                PUSH    1202h
                CALL    DrawString

TheEnd:         BR      TheEnd

;===============================================================================
