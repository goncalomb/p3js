;===============================================================================
;
;       Empty template for new programs (replace with Title)
;
;       Year Author <Email>
;       Year Author <Email>
;
;       Description
;
;===============================================================================

; Interrupt Vector Table addresses (fe00h to feffh)
INT0_BTN        EQU     fe00h
INT1_BTN        EQU     fe01h
INT2_BTN        EQU     fe02h
; ...
INT14_BTN       EQU     fe0eh
INT15_TIMER     EQU     fe0fh

; I/O addresses (ff00h to ffffh)
DISP7SEG_0      EQU     fff0h
DISP7SEG_1      EQU     fff1h
DISP7SEG_2      EQU     fff2h
DISP7SEG_3      EQU     fff3h
LCD_CONTROL     EQU     fff4h
LCD_WRITE       EQU     fff5h
TIMER_VALUE     EQU     fff6h
TIMER_CONTROL   EQU     fff7h
LEDS            EQU     fff8h
SWITCHES        EQU     fff9h
INT_MASK        EQU     fffah
TERM_CURSOR     EQU     fffch
TERM_STATE      EQU     fffdh
TERM_WRITE      EQU     fffeh
TERM_READ       EQU     ffffh

; Other constants
STR_END         EQU     0000h
SP_ADDRESS      EQU     fdffh
INT_MASK_VALUE  EQU     ffffh

;============== Data Region (starting at address 8000h) ========================

                ORIG    8000h

                ; allocate variables and data here (WORD, STR and TAB)

A_VARIABLE      WORD    1010011010b
A_STRING        STR     'A String', ' more words', '!', STR_END
A_BUFFER        TAB     1337

;============== Code Region (starting at address 0000h) ========================

                ORIG    0000h
                JMP     Main                    ; jump to main

;-------------- Routines -------------------------------------------------------

                ; put routines here

Int0Routine:    NOP     ; a routine routine for INT0
                INC     M[A_VARIABLE]
                RTI

ARoutine:       NOP     ; a routine that does nothing
                MOV     R2, M[A_VARIABLE]
                RET

;-------------- Main Program ---------------------------------------------------

Main:           MOV     R1, SP_ADDRESS
                MOV     SP, R1                  ; set stack pointer

                MOV     R1, Int0Routine
                MOV     M[INT0_BTN], R1         ; set routine for INT0

                MOV     R1, INT_MASK_VALUE
                MOV     M[INT_MASK], R1         ; set interrupt mask
                ENI                             ; enable interrupts

                ; start code here

                CALL    ARoutine

TheEnd:         BR      TheEnd

;===============================================================================
