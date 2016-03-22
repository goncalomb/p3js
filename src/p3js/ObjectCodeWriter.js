module.exports = function(p3js) {

	eval(p3js.extractConstants());

	var ObjectCodeWriter = function() {
		this.buffer = new ArrayBuffer(MEMORY_SIZE * MEMORY_WORD_SIZE);
		this._view = new DataView(this.buffer);
		this._usedAddresses = Array.apply(null, Array(MEMORY_SIZE)).map(Number.prototype.valueOf, 0);
		this._position = 0;
	}

	ObjectCodeWriter.prototype.getPosition = function() {
		if (this._position >= MEMORY_SIZE) {
			throw "Internal Error: invalid memory position"
		}
		return this._position;
	}

	ObjectCodeWriter.prototype.setPosition = function(pos) {
		if (pos >= MEMORY_SIZE) {
			throw "Internal Error: invalid memory position"
		}
		this._position = pos;
	}

	ObjectCodeWriter.prototype.movePosition = function(off) {
		this._position += off;
	}

	ObjectCodeWriter.prototype.getUsedAddresses = function() {
		return this._usedAddresses;
	};

	ObjectCodeWriter.prototype.write = function(value, t) {
		if (this._position >= MEMORY_SIZE) {
			throw "Internal Error: end of memory reached"
		}
		if (this._usedAddresses[this._position]) {
			throw "Internal Error: overlapping memory"
		}
		this._view.setInt16(this._position * 2, value, true);
		this._usedAddresses[this._position] = (t || 1);
		this._position++;
	}

	ObjectCodeWriter.prototype.writeInstZero = function(op) {
		op = op & 0x3f; // 6 bits
		this.write(op << 10);
	}

	ObjectCodeWriter.prototype.writeInstConstant = function(op, c) {
		op = op & 0x3f; // 6 bits
		this.write((op << 10) | (c & 0x3ff));
	}

	ObjectCodeWriter.prototype.writeInstOneC = function(op, c, m, r, w) {
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

	ObjectCodeWriter.prototype.writeInstOne = function(op, m, r, w) {
		this.writeInstOneC(op, 0, m, r, w);
	}

	ObjectCodeWriter.prototype.writeInstTwo = function(op, s, r0, m, r1, w) {
		s = s & 0x01 // 1 bits
		r0 = r0 & 0x07; // 3 bits
		this.writeInstOneC(op, ((s << 3) | r0), m, r1, w);
	}

	ObjectCodeWriter.prototype.writeJump = ObjectCodeWriter.prototype.writeInstOne;
	ObjectCodeWriter.prototype.writeJumpC = ObjectCodeWriter.prototype.writeInstOneC;

	ObjectCodeWriter.prototype.writeJumpR = function(op, d) {
		this.writeJumpRC(op, 0, d);
	}

	ObjectCodeWriter.prototype.writeJumpRC = function(op, c, d) {
		op = op & 0x3f; // 6 bits
		c = c & 0x0f; // 4 bits
		d = d & 0x3f; // 6 bits
		this.write((op << 10) | (c << 6) | d);
	}

	return ObjectCodeWriter;
};
