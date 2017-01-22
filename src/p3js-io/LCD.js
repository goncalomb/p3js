var LCD = module.exports = function(simulator) {
	this._simulator = simulator;
	this._onStateChange = null;
	this._onTextChange = null;
	this._active = true;
	this._x = 0;
	this._y = 0;
	this._text = null;
}

LCD.prototype._control = function(v) {
	if ((v & 0x20) != 0) {
		this._text = null;
		if (this._onStateChange) this._onStateChange(this._text, this._active);
	}
	if ((v & 0x8000) == 0) {
		if (this._active) {
			this._active = false;
			if (this._onStateChange) this._onStateChange(this._text, this._active);
		}
	} else if (!this._active) {
		this._active = true;
		if (this._onStateChange) this._onStateChange(this._text, this._active);
	}
	this._x = v & 0xf;
	this._y = v >> 4 & 0x1;
}

LCD.prototype._write = function(v) {
	if (!this._text) {
		this._text = [
			Array(16 + 1).join(" "),
			Array(16 + 1).join(" ")
		];
	}
	var str = this._text[this._y];
	str = str.substr(0, this._x) + String.fromCharCode(v) + str.substr(this._x + 1, str.length);
	this._text[this._y] = str;
	if (this._active) {
		if (this._onTextChange) this._onTextChange(this._text, this._active, this._x, this._y);
	}
}

LCD.prototype.bindHandlers = function(addrControl, addrWrite) {
	var self = this;
	this._simulator._ioc.registerWriteHandler(addrControl || 0xfff4, function(value) {
		self._control(value);
	});
	this._simulator._ioc.registerWriteHandler(addrWrite || 0xfff5, function(value) {
		self._write(value);
	});
}

LCD.prototype.onStateChange = function(fn) {
	this._onStateChange = fn;
}

LCD.prototype.onTextChange = function(fn) {
	this._onTextChange = fn;
}

LCD.prototype.reset = function() {
	this._active = true;
	this._x = 0;
	this._y = 0;
	this._text = null;
	if (this._onStateChange) this._onStateChange(this._text, this._active);
}
