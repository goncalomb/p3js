var IOTerminal = module.exports = function(p3sim) {
	this._$wrapper = $("#io-terminal-wrapper");
	this._$content = $("#io-terminal");

	this.reset();
	var self = this;

	this._$wrapper.on("keypress", function(e) {
		e.preventDefault();
		if (p3sim.isRunning()) {
			if (e.which == 13) {
				self._last_key = 10 // send ENTER as LF insted of CR
			} else {
				self._last_key = e.which;
			}
		}
	});
	this._$wrapper.on("keydown", function(e) {
		if (e.which == 8 || e.which == 27) { // BS and ESC
			e.preventDefault();
			if (p3sim.isRunning()) {
				self._last_key = e.which;
			}
		}
	});
}

IOTerminal.BUFFER_SIZE = 64 * 80;
IOTerminal.REPLACEMENT_CHAR = String.fromCharCode(0xfffd);

IOTerminal.prototype._charFromCode = function(code, deny_lf) {
	if (!deny_lf && code == 10) {
		return "\n";
	} else if (code < 0x20 || (code >= 0x7f && code <= 0xa0) || code == 0xad || code > 0xff) {
		return this.constructor.REPLACEMENT_CHAR;
	} else {
		return String.fromCharCode(code);
	}
}

IOTerminal.prototype.reset = function() {
	this._$content.text("");
	this._buffer = "";
	this._cursor_mode = false;
	this._last_key = 0;
	this._last_lf_index = 0;
	this._x = 0;
	this._y = 0;
}

IOTerminal.prototype.state = function() {
	return (this._last_key ? 1 : 0);
}

IOTerminal.prototype.read = function() {
	var k = this._last_key;
	this._last_key = 0;
	return k;
}

IOTerminal.prototype.control = function(v) {
	if (v == 0xffff) {
		this._cursor_mode = true;
		this._x = 0;
		this._y = 0;
		var empty_line = Array(80 + 1).join(" ") + "\n"
		this._buffer = Array(24 + 1).join(empty_line).slice(0, -1);
		this._$content.text(this._buffer);
	} else {
		this._x = v & 0xff;
		this._y = v >> 8 & 0xff;
	}
}

IOTerminal.prototype.write = function(v) {
	var val = this._buffer;
	if (!this._cursor_mode) {
		val += this._charFromCode(v);
		this._last_lf_index++;
		if (v == 10) { // test for LF
			this._last_lf_index = 0;
		} else if (this._last_lf_index == 80) {
			this._last_lf_index = 0;
			val += "\n";
		}
		if (val.length > this.constructor.BUFFER_SIZE) {
			val = val.substr(val.indexOf("\n") + 1);
		}
	} else if (this._x < 80 && this._y < 24) {
		var i = this._x + this._y*81;
		val = val.substr(0, i) + this._charFromCode(v, true) + val.substr(i + 1, val.length);
	}
	this._$content.text(this._buffer = val);
}
