var Terminal = module.exports = function(simulator) {
	this._simulator = simulator;
	this._onClear = null;
	this._onTextChange = null;
	this._buffer = [];
	this._cursorMode = false;
	this._lastKey = 0;
	this._x = 0;
	this._y = 0;
}

Terminal.BUFFER_SIZE = 64 * 80;
Terminal.REPLACEMENT_CHAR = String.fromCharCode(0xfffd);

Terminal._charFromCode = function(code) {
	if (code < 0x20 || (code >= 0x7f && code <= 0xa0) || code == 0xad || code > 0xff) {
		return this.REPLACEMENT_CHAR;
	} else {
		return String.fromCharCode(code);
	}
}

Terminal.prototype._control = function(v) {
	if (v == 0xffff) {
		this._cursorMode = true;
		this._x = 0;
		this._y = 0;
		var empty_line = Array(80 + 1).join(" ");
		this._buffer = Array.apply(null, new Array(24)).map(function () { return empty_line; });
		if (this._onClear) this._onClear(this._buffer, this._cursorMode);
	} else {
		this._x = v & 0xff;
		this._y = v >> 8 & 0xff;
	}
}

Terminal.prototype._write = function(v) {
	if (!this._cursorMode) {
		if (this._buffer.length == 0) {
			this._buffer.push("");
		}
		var lf = false;
		var val = this._buffer[this._buffer.length - 1];
		if (v == 10) { // LF
			this._buffer.push("");
			lf = true;
		} else if (val.length >= 80) {
			val = this.constructor._charFromCode(v);
			this._buffer.push(val);
			lf = true;
		} else {
			val += this.constructor._charFromCode(v);
			this._buffer[this._buffer.length - 1] = val;
		}
		if (this._buffer.length > 64) {
			this._buffer.shift();
		}
		if (this._onTextChange) this._onTextChange(this._buffer, this._cursorMode, -1, -1, 0, "\u0000", lf);
	} else if (this._x < 80 && this._y < 24) {
		var c = this.constructor._charFromCode(v);
		var val = this._buffer[this._y];
		val = val.substr(0, this._x) + v + val.substr(this._x + 1, val.length);
		this._buffer[this._y] = val
		if (this._onTextChange) this._onTextChange(this._buffer, this._cursorMode, this._x, this._y, v, c, false);
	}
}

Terminal.prototype.bindHandlers = function(addrControl, addrState, addrWrite, addrRead) {
	var self = this;
	this._simulator._ioc.registerWriteHandler(addrControl || 0xfffc, function(value) {
		self._control(value);
	});
	this._simulator._ioc.registerReadHandler(addrState || 0xfffd, function() {
		return (self._lastKey ? 1 : 0);
	});
	this._simulator._ioc.registerWriteHandler(addrWrite || 0xfffe, function(value) {
		self._write(value);
	});
	this._simulator._ioc.registerReadHandler(addrRead || 0xffff, function() {
		var k = self._lastKey;
		self._lastKey = 0;
		return k;
	});
}

Terminal.prototype.sendKey = function(key) {
	this._lastKey = key;
}

Terminal.prototype.onClear = function(fn) {
	this._onClear = fn;
}

Terminal.prototype.onTextChange = function(fn) {
	this._onTextChange = fn;
}

Terminal.prototype.reset = function() {
	this._buffer = [];
	this._cursorMode = false;
	this._lastKey = 0;
	this._x = 0;
	this._y = 0;
	if (this._onClear) this._onClear(this._buffer, this._cursorMode);
}
