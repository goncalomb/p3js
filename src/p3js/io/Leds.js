var Leds = module.exports = function(simulator) {
	this._simulator = simulator;
	this._onStateChange = null;
	this._value = 0;
}

Leds.prototype.bindHandlers = function(addrControl) {
	var self = this;
	this._simulator._ioc.registerWriteHandler(addrControl || 0xfff8, function(value) {
		self._value = value;
		if (self._onStateChange) self._onStateChange(self._value);
	});
}

Leds.prototype.onStateChange = function(fn) {
	this._onStateChange = fn;
}

Leds.prototype.reset = function() {
	this._value = 0;
	if (this._onStateChange) this._onStateChange(this._value);
}
