; Write some assembly code here.
; Then click 'Assemble and Run' to run it on the P3 simulator.

; For more information check 'About P3JS'.


; Try the Demos ----->  ----->  ----->  ----->  ----->  ----->  ----->  ----->


; This is a very short program that fills the memory with ac5fh!
; Click 'Assemble and Run' to test.

                ORIG    8000h

                MOV     R1, M[PC]
                MOV     M[PC], R1

; How does it work? Why is the value at the address 8000h not ac5fh?



; HINT
;  ||
;  ||
;  \/






































; HINT: Notice that ac5fh is the binary code for 'MOV M[PC], R1'.
