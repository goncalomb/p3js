(function() {

	var p3js = window.p3js = (window.p3js || { });
	var assembler = p3js.assembler = { };
	eval(p3js.extractConstants());

	var BufferEx = function(size) {
		this.buffer = new ArrayBuffer(MEMORY_SIZE_BYTES);
		this._view = new DataView(this.buffer);
		this._usedAddresses = Array.apply(null, Array(MEMORY_SIZE)).map(Number.prototype.valueOf, 0);
		this._position = 0;
	}

	BufferEx.prototype.getPosition = function() {
		if (this._position >= MEMORY_SIZE_BYTES) {
			throw "Internal Error: invalid memory position"
		}
		return this._position;
	}

	BufferEx.prototype.setPosition = function(pos) {
		if (pos >= MEMORY_SIZE_BYTES) {
			throw "Internal Error: invalid memory position"
		}
		this._position = pos * 2;
	}

	BufferEx.prototype.write = function(value) {
		if (this._position >= MEMORY_SIZE_BYTES) {
			throw "Internal Error: end of memory reached"
		}
		if (this._usedAddresses[this._position]) {
			throw "Internal Error: overlapping memory"
		}
		this._view.setInt16(this._position, value, true);
		this._usedAddresses[this._position] = 1;
		this._position += 2;
	}

	assembler.assembleData = function(data) {
		var buffer = new BufferEx();
		var labels = { };

		var set_label = function(label, value, n) {
			if (labels[label] !== undefined) {
				throw "Label " + label + " already defined, on line " + inst.n;
			}
			labels[label] = value;
			console.log(label + " = " + value)
		}

		var get_w = function(d, n) {
			if (d.w !== undefined) {
				if (typeof d.w.valueOf() == "string") {
					if (labels[d.w]) {
						return labels[d.w];
					} else {
						throw "Undefined label " + l + ", on line " + inst.n;
					}
				}
				return d.w;
			}
			return 0;
		}

		for (var i = 0, l = data.length; i < l; i++) {
			var inst = data[i];
			// inst.n: line #; inst.l: label; inst.i: instruction; inst.c: condition; inst.o: operands;
			var inst_dec = (p3js.instructions[inst.i] ? p3js.instructions[inst.i] : p3js.pseudoInstructions[inst.i]);
			var num_operands = p3js.getNumOperands(inst_dec.type);
			if (num_operands === null && inst.o.length < 1) {
				throw "Instruction " + inst.i + " expects at least 1 operand, on line " + inst.n;
			} else if (num_operands !== null && num_operands != inst.o.length) {
				throw "Instruction " + inst.i + " expects " + num_operands + " operand(s), on line " + inst.n;
			}

			// pseudo-instructions
			if (
				(inst.i == "orig" || inst.i == "equ" || inst.i == "word" || inst.i == "tab") &&
				inst.o[0].type != OPRD_TYPE_IMMEDIATE
			) {
				throw "Invalid operand for " + inst.i + ", on line " + inst.n;
			}
			// TODO: check if inst.o[0].w is a label!!!!!1
			switch (inst.i) {
				case "orig":
					console.log("ORIG " + inst.o[0].w)
					buffer.setPosition(inst.o[0].w);
					continue;
				case "equ":
					set_label(inst.l, inst.o[0].w);
					continue;
				case "word":
					set_label(inst.l, buffer.getPosition());
					buffer.write(inst.o[0].w);
					continue;
				case "str":
					inst.o.forEach(function(o) {
						if (o.type == OPRD_TYPE_STRING) {
							for (var i = 0, l = o.w.length; i < l; i++) {
								buffer.write(o.w.charCodeAt(i));
							}
						} else if (o.type == OPRD_TYPE_IMMEDIATE) {
							buffer.write(get_w(o));
						} else {
							throw "Invalid operand for STR, on line " + inst.n;
						}
					});
					continue;
				case "tab":
					set_label(inst.l, buffer.getPosition());
					for (var i = 0; i < inst.o[0].w; i++) {
						buffer.write(0);
					}
					continue;
			}

			// instructions
		}

		return buffer.buffer;
	};

})();
