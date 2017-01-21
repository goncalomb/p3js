var Seg7Display = module.exports = function(simulator) {
	this._simulator = simulator;
	this._onStateChange = null;
	this._value = 0;
}

Seg7Display.prototype._set = function(value, mask) {
	this._value = (this._value & mask) | value;
	if (this._onStateChange) this._onStateChange(this._value);
}

Seg7Display.prototype.bindHandlers = function(addrControl0, addrControl1, addrControl2, addrControl3) {
	var self = this;
	this._simulator._ioc.registerWriteHandler(addrControl0 || 0xfff0, function(value) {
		self._set(value & 0xf, 0xfff0);
	});
	this._simulator._ioc.registerWriteHandler(addrControl1 || 0xfff1, function(value) {
		self._set((value & 0xf) << 4, 0xff0f);
	});
	this._simulator._ioc.registerWriteHandler(addrControl2 || 0xfff2, function(value) {
		self._set((value & 0xf) << 8, 0xf0ff);
	});
	this._simulator._ioc.registerWriteHandler(addrControl3 || 0xfff3, function(value) {
		self._set((value & 0xf) << 12, 0x0fff);
	});
}

Seg7Display.prototype.onStateChange = function(fn) {
	this._onStateChange = fn;
}

Seg7Display.prototype.reset = function() {
	this._value = 0;
	if (this._onStateChange) this._onStateChange(this._value);
}
