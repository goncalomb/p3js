;===============================================================================
; Programa Demo1.as
;
; Descricao: Demonstracao da utilizacao dos perifericos e interrupcoes no P3
;            (1) Escrita de mensagem numa posição pre-definida da janela de
;                texto.
;            (2) Ciclo de escrita no display de 7 segmentos
;            (3) Pausa/Recomeco da escrita por accao do interruptor da direita
;            (4) Mudanca de display por activacao da interrupcao I0
;            (5) Alteracao do estado dos LEDs em funcao do numero de interrup.
;            (6) Escrita no LCD por activação da interrupção I1
;
; Autor: Nuno Horta
; Data: 09/05/2003                              Ultima Alteracao:09/05/2006
;===============================================================================

;===============================================================================
; ZONA I: Definicao de constantes
;         Pseudo-instrucao : EQU
;===============================================================================

; TEMPORIZACAO
DELAYVALUE      EQU     0100h

; STACK POINTER
SP_INICIAL      EQU     FDFFh

; INTERRUPCOES
TAB_INT0        EQU     FE00h
TAB_INT1        EQU     FE01h
MASCARA_INT     EQU     FFFAh

; I/O a partir de FF00H
DISP7S1         EQU     FFF0h
DISP7S2         EQU     FFF1h
LCD_WRITE       EQU     FFF5h
LCD_CURSOR      EQU     FFF4h
LEDS            EQU     FFF8h
INTERRUPTORES   EQU     FFF9h
IO_CURSOR       EQU     FFFCh
IO_WRITE        EQU     FFFEh

LIMPAR_JANELA   EQU     FFFFh
XY_INICIAL      EQU     0614h
FIM_TEXTO       EQU     '@'


;===============================================================================
; ZONA II: Definicao de variaveis
;          Pseudo-instrucoes : WORD - palavra (16 bits)
;                              STR  - sequencia de caracteres.
;          Cada caracter ocupa 1 palavra
;===============================================================================

                ORIG    8000h
VarTexto1       STR     '** LEEC 05/06 - 2º Semestre **',FIM_TEXTO



;===============================================================================
; ZONA III: Codigo
;           conjunto de instrucoes Assembly, ordenadas de forma a realizar
;           as funcoes pretendidas
;===============================================================================


                ORIG    0000h
                JMP     inicio


;===============================================================================
; RotinaInt0: Rotina de interrupcao 0
;               Entradas: R2, R3 - Portos dos Display de 7 Segmentos
;                         R4 - Contador de interrupcoes
;               Saidas:   R2, R3, R4
;               Efeitos: (1) Comutacao de R2 e R3
;                        (2) Incremento de R4
;===============================================================================
RotinaInt0:     XCH     R2, R3
                INC     R4
                MOV     M[LEDS], R4
                RTI

;===============================================================================
; RotinaInt1: Rotina de interrupcao 1
;               Entradas: R4, R1
;               Saidas:   R4
;               Efeitos: (1) Duplica R4
;                        (2) Escreve '@' no LCD
;===============================================================================

RotinaInt1:     ROL     R4, 1
                MOV     R6, 8018h
                MOV     M[LCD_CURSOR], R6
                MOV     R6, 0040h
                MOV     M[LCD_WRITE], R6
                RTI

;===============================================================================
; LimpaJanela: Rotina que limpa a janela de texto.
;               Entradas: --
;               Saidas: ---
;               Efeitos: ---
;===============================================================================

LimpaJanela:    PUSH    R2
                MOV     R2, LIMPAR_JANELA
                MOV     M[IO_CURSOR], R2
                POP     R2
                RET

;===============================================================================
; EscString: Rotina que efectua a escrita de uma cadeia de caracter, terminada
;            pelo caracter FIM_TEXTO, na janela de texto numa posicao
;            especificada. Pode-se definir como terminador qualquer caracter
;            ASCII.
;               Entradas: pilha - posicao para escrita do primeiro carater
;                         pilha - apontador para o inicio da "string"
;               Saidas: ---
;               Efeitos: ---
;===============================================================================

EscString:      PUSH    R1
                PUSH    R2
                PUSH    R3
                MOV     R2, M[SP+6]   ; Apontador para inicio da "string"
                MOV     R3, M[SP+5]   ; Localizacao do primeiro carater
Ciclo:          MOV     M[IO_CURSOR], R3
                MOV     R1, M[R2]
                CMP     R1, FIM_TEXTO
                BR.Z    FimEsc
                CALL    EscCar
                INC     R2
                INC     R3
                BR      Ciclo
FimEsc:         POP     R3
                POP     R2
                POP     R1
                RETN    2                ; Actualiza STACK

;===============================================================================
; EscCar: Rotina que efectua a escrita de um caracter para o ecran.
;         O caracter pode ser visualizado na janela de texto.
;               Entradas: R1 - Caracter a escrever
;               Saidas: ---
;               Efeitos: alteracao da posicao de memoria M[IO]
;===============================================================================

EscCar:         MOV     M[IO_WRITE], R1
                RET

;===============================================================================
; EscDisplay: Rotina que efectua escrita no DISPLAY de 7 segmentos
;               Entradas: R1 - Valor a enviar para o porto do DISPLAY
;                         R2 - Porto do DISPLAY a utilizar
;               Saidas: ---
;               Efeitos: alteracao da posicao de memoria/porto M[R2]
;===============================================================================

EscDisplay:     MOV     M[R2], R1
                RET

;===============================================================================
; Delay: Rotina que permite gerar um atraso
;               Entradas: ---
;               Saidas: ---
;               Efeitos: ---
;===============================================================================

Delay:          PUSH    R1
                MOV     R1, DELAYVALUE
DelayLoop:      DEC     R1
                BR.NZ   DelayLoop
                POP     R1
                RET

;===============================================================================
;                                Programa prinicipal
;===============================================================================
inicio:         MOV     R1, SP_INICIAL
                MOV     SP, R1
                MOV     R1, RotinaInt0
                MOV     M[TAB_INT0], R1
                MOV     R1, RotinaInt1
                MOV     M[TAB_INT1], R1
                MOV     R1,0003h
                MOV     M[MASCARA_INT], R1
                MOV     R2, DISP7S1
                MOV     R3, DISP7S2
                ENI
                CALL    LimpaJanela
                PUSH    VarTexto1           ; Passagem de parametros pelo STACK
                PUSH    XY_INICIAL          ; Passagem de parametros pelo STACK
                CALL    EscString
ResetCont:      MOV     R1, 0001H
CicloCont:      CALL    EscDisplay          ; Passagem de parametros por registo
                CALL    Delay
Stop:           MOV     R5, M[INTERRUPTORES]
                TEST    R5, 0001H
                BR.NZ   Stop
                ROL     R1, 1
                TEST    R1, 0010H
                BR.Z    CicloCont
                BR      ResetCont
;===============================================================================
