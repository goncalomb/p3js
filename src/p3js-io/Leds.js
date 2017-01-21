var Leds = module.exports = function(simulator) {
	this._simulator = simulator;
	this._onStateChange = null;
}

Leds.prototype.bindHandlers = function(addrControl) {
	var self = this;
	this._simulator._ioc.registerWriteHandler(addrControl || 0xfff8, function(value) {
		if (self._onStateChange) self._onStateChange(value);
	});
}

Leds.prototype.onStateChange = function(fn) {
	this._onStateChange = fn;
}

Leds.prototype.reset = function() {
	if (this._onStateChange) this._onStateChange(0);
}
