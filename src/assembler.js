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
		if (this._position >= MEMORY_SIZE) {
			throw "Internal Error: invalid memory position"
		}
		return this._position;
	}

	BufferEx.prototype.setPosition = function(pos) {
		if (pos >= MEMORY_SIZE) {
			throw "Internal Error: invalid memory position"
		}
		this._position = pos;
	}

	BufferEx.prototype.write = function(value) {
		if (this._position >= MEMORY_SIZE) {
			throw "Internal Error: end of memory reached"
		}
		if (this._usedAddresses[this._position]) {
			throw "Internal Error: overlapping memory"
		}
		this._view.setInt16(this._position * 2, value, true);
		this._usedAddresses[this._position] = 1;
		this._position++;
	}

	BufferEx.prototype.writeInstZero = function(op) {
		op = op & 0x3f; // 6 bits
		this.write(op << 10);
	}

	BufferEx.prototype.writeInstConstant = function(op, c) {
		op = op & 0x3f; // 6 bits
		this.write((op << 10) | (c & 0x3ff));
	}

	BufferEx.prototype.writeInstOneC = function(op, c, m, r, w) {
		op = op & 0x3f; // 6 bits
		c = c & 0x0f; // 4 bits
		m = m & 0x03; // 2 bits
		r = r & 0x0f; // 4 bits
		if (m == 2) {
			r = 0;
		}
		this.write((op << 10) | (c << 6) | (m << 4) | r);
		if (m == 2 || m == 3) {
			this.write(w);
		}
	}

	BufferEx.prototype.writeInstOne = function(op, m, r, w) {
		this.writeInstOneC(op, 0, m, r, w);
	}

	BufferEx.prototype.writeInstTwo = function(op, s, r0, m, r1, w) {
		s = s & 0x01 // 1 bits
		r0 = r0 & 0x07; // 3 bits
		this.writeInstOneC(op, ((s << 3) | r0), m, r1, w);
	}

	BufferEx.prototype.writeJump = BufferEx.prototype.writeInstOne;
	BufferEx.prototype.writeJumpC = BufferEx.prototype.writeInstOneC;

	BufferEx.prototype.writeJumpR = function(op, d) {
		this.writeJumpRC(op, 0, d);
	}

	BufferEx.prototype.writeJumpRC = function(op, c, d) {
		op = op & 0x3f; // 6 bits
		c = c & 0x0f; // 4 bits
		d = d & 0x3f; // 6 bits
		this.write((op << 10) | (c << 6) | d);
	}

	assembler.assembleData = function(data) {
		var buffer = new BufferEx();
		var labels = { };

		var set_label = function(label, value) {
			if (labels[label] !== undefined) {
				throw "Label " + label + " already defined, on line " + inst.n;
			}
			labels[label] = value;
		}

		var get_w = function(operand) {
			if (operand.w !== undefined) { // TODO: don't check for w, use type
				if (typeof operand.w.valueOf() == "string") {
					if (labels[operand.w] === undefined) {
						throw "Undefined label " + operand.w + ", on line " + inst.n;
					}
					return labels[operand.w];
				}
				return operand.w;
			}
			return 0;
		}

		var get_m = function(operand) {
			switch (operand.type) {
				case OPRD_TYPE_REGISTER:
				case OPRD_TYPE_SP:
				case OPRD_TYPE_PC:
					return 0;
				case OPRD_TYPE_REGISTER_INDIRECT:
					return 1;
				case OPRD_TYPE_IMMEDIATE:
					return 2;
				case OPRD_TYPE_DIRECT:
				case OPRD_TYPE_INDEXED:
				case OPRD_TYPE_RELATIVE:
				case OPRD_TYPE_BASED:
					return 3;
			}
			throw "Invalid operand for " + inst.i + ", on line " + inst.n;
		}

		// call get_r after a successful get_m
		var get_r = function(operand) {
			if (operand.type == OPRD_TYPE_IMMEDIATE || operand.type == OPRD_TYPE_DIRECT) {
				return REGISTER_0
			}
			return operand.r;
		}

		// TODO: we need a second pass of the assembler!!!!!!!!
		// the first pass collects de labels, the second assembles

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
				(inst.i == "ORIG" || inst.i == "EQU" || inst.i == "WORD" || inst.i == "TAB") &&
				inst.o[0].type != OPRD_TYPE_IMMEDIATE
			) {
				throw "Invalid operand for " + inst.i + ", on line " + inst.n;
			}
			// TODO: check if inst.o[0].w is a label!!!!!1
			switch (inst.i) {
				case "ORIG":
					buffer.setPosition(inst.o[0].w);
					continue;
				case "EQU":
					set_label(inst.l, inst.o[0].w);
					continue;
				case "WORD":
					set_label(inst.l, buffer.getPosition());
					buffer.write(inst.o[0].w);
					continue;
				case "STR":
					set_label(inst.l, buffer.getPosition());
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
				case "TAB":
					set_label(inst.l, buffer.getPosition());
					for (var i = 0; i < inst.o[0].w; i++) {
						buffer.write(0);
					}
					continue;
			}

			if (inst.l) {
				set_label(inst.l, buffer.getPosition());
			}

			var operand_0 = inst.o[0];
			var operand_1 = inst.o[1];

			// instructions
			switch (inst_dec.type) {
				case "0":
					buffer.writeInstZero(inst_dec.opcode);
					continue;
				case "0c":
					if (operand_0.type != OPRD_TYPE_IMMEDIATE) {
						throw "Invalid operand for " + inst.i + ", on line " + inst.n;
					}
					var w = get_w(operand_0);
					// TODO: check constant size, these constants are 10 bit long
					buffer.writeInstConstant(inst_dec.opcode, w);
					continue;
				case "1":
					var m = get_m(operand_0);
					var r = get_r(operand_0);
					var w = get_w(operand_0);
					// XXX: some instructions may not accept OPRD_TYPE_IMMEDIATE
					// XXX: do some tests with OPRD_TYPE_SP and OPRD_TYPE_BASED
					buffer.writeInstOne(inst_dec.opcode, m, r, w);
					continue;
				case "1c":
					var m = get_m(operand_0);
					if (operand_1.type != OPRD_TYPE_IMMEDIATE) {
						throw "Invalid operand for " + inst.i + ", on line " + inst.n;
					}
					var c = get_w(operand_1);
					var r = get_r(operand_0);
					var w = get_w(operand_0);
					// TODO: don't accept OPRD_TYPE_IMMEDIATE
					// TODO: check constant size, these constants are 4 bit long
					buffer.writeInstOneC(inst_dec.opcode, c, m, r, w);
					continue;
				case "2":
					if (operand_0.type == OPRD_TYPE_IMMEDIATE) {
						throw "Fist operand cannot be immediate, on line " + inst.n;
					}
					var s, reg, other_operand;
					if (operand_0.type == OPRD_TYPE_REGISTER) {
						s = 1;
						reg = operand_0.r;
						other_operand = operand_1;
					} else if (operand_1.type == OPRD_TYPE_REGISTER) {
						s = 0;
						reg = operand_1.r;
						other_operand = operand_0;
					} else {
						throw "One of the operands must be a resister, on line " + inst.n;
					}
					if (other_operand.type == OPRD_TYPE_IMMEDIATE && (inst.i == "MUL" || inst.i == "DIV" || inst.i == "XCH")) {
						throw inst.i + " cannot have immediate operand, on line " + inst.n;
					}
					// XXX: test other special cases (SP etc.)
					var m = get_m(other_operand);
					var r = get_r(other_operand);
					var w = get_w(other_operand);
					buffer.writeInstTwo(inst_dec.opcode, s, reg, m, r, w);
					continue;
			}
			console.log(inst.i);
		}

		return buffer.buffer;
	};

})();
