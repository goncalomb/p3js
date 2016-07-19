;===============================================================================
;
;       Empty template for new programs (replace with Title)
;
;       Year Author <Email>
;       Year Author <Email>
;
;       Description
;
;============== Constants ======================================================

; Interrupt table (fe00h - feffh)
; Ends at feffh, but there are no devices connected to interrupts above fe0fh.
INT0_BTN        EQU     fe00h
INT1_BTN        EQU     fe01h
INT2_BTN        EQU     fe02h
; ...
INT14_BTN       EQU     fe02h
INT15_TIMER     EQU     fe0fh

; I/O addresses (ff00h - ffffh)
; Starts at ff00h, but there are no devices connected below fff0h.
DISP7SEG_0      EQU     fff0h   ; write
DISP7SEG_1      EQU     fff1h   ; write
DISP7SEG_2      EQU     fff2h   ; write
DISP7SEG_3      EQU     fff3h   ; write
LCD_CONTROL     EQU     fff4h   ; write
LCD_WRITE       EQU     fff5h   ; write
TIMER_VALUE     EQU     fff6h   ; read/write
TIMER_CONTROL   EQU     fff7h   ; read/write
LEDS            EQU     fff8h   ; write
SWITCHES        EQU     fff9h   ; read
INT_MASK        EQU     fffah   ; read/write
TERM_CURSOR     EQU     fffch   ; write
TERM_STATE      EQU     fffdh   ; read
TERM_WRITE      EQU     fffeh   ; write
TERM_READ       EQU     ffffh   ; read

; Default values
STR_END         EQU     0000h   ; string terminator
SP_ADDRESS      EQU     fdffh   ; starts at the last available address (fdffh)
INT_MASK_VALUE  EQU     ffffh   ; ffffh = enable all

;============== Data Region (starting at address 8000h) =======================

                ORIG    8000h

A_VARIABLE      WORD    1010011010b
A_STRING        STR     'A String', ' more words', '!', STR_END
A_BUFFER        TAB     1337

;============== Code Region (starting at address 0000h) ========================

                ORIG    0000h
                JMP     Main                    ; jump to main

;-------------- Routines -------------------------------------------------------

                ; a routine routine for INT0_BTN

Int0Routine:    NOP
                RTI

                ; a routine routine for INT1_BTN

Int1Routine:    NOP
                RTI

                ; a routine routine for INT2_BTN

Int2Routine:    NOP
                RTI

                ; a routine that does nothing

ARoutine:       NOP
                RET

                ; another routine that does nothing

AnotherRoutine: NOP
                RET

;-------------- Main Program ---------------------------------------------------

Main:           MOV     R1, SP_ADDRESS
                MOV     SP, R1                  ; set stack pointer

                MOV     R1, Int0Routine         ; set routine for INT0
                MOV     M[INT0_BTN], R1
                MOV     R1, Int1Routine         ; set routine for INT1
                MOV     M[INT1_BTN], R1
                MOV     R1, Int2Routine         ; set routine for INT2
                MOV     M[INT2_BTN], R1

                MOV     R1, ffffh
                MOV     M[INT_MASK], R1         ; set interrupt mask
                ENI                             ; enable interrupts

                CALL    ARoutine
                CALL    AnotherRoutine
                NOP
                NOP
                NOP

TheEnd:         BR      TheEnd

;===============================================================================
