(function() {

	var p3js = window.p3js = (window.p3js || { });
	eval(p3js.extractConstants());

	var simulator = p3js.Simulator = function() {
		if (!(this instanceof simulator)) {
			return new simulator();
		}
		this._registers = [      // R0    = 0
			0, 0, 0, 0, 0, 0, 0, // R1-7  general use
			0, 0, 0,             // R8-10 restricted use
			0,                   // R11   = SD (source data)
			0,                   // R12   = EA (effective address)
			0,                   // R13   = RD (result data)
			0,                   // R14   = SP (stack pointer)
			0                    // R15   = PC (program counter)
		];
		this._ri = 0;            // RI    (instruction register)
		this._re = 0;            // RE    (status register)
		this._car = 0;           // CAR   (control address register)
		this._sbr = 0;           // SBR   (subroutine branch register)
	};

})();
