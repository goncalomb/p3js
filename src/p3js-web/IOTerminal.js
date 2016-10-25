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

IOTerminal.prototype.reset = function() {
	this._$content.text("");
	this._buffer = "";
	this._cursor_mode = false;
	this._last_key = 0;
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
		val += String.fromCharCode(v);
		if ((val.length + 1)%81 == 0) {
			val += "\n";
		}
		if (val.length > 64 * 81) {
			val = val.substr(81);
		}
	} else if (this._x < 80 && this._y < 24) {
		var i = this._x + this._y*81;
		val = val.substr(0, i) + String.fromCharCode(v) + val.substr(i + 1, val.length);
	}
	this._$content.text(this._buffer = val);
}
