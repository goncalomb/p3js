var Switches = module.exports = function(simulator) {
	this._simulator = simulator;
	this._value = 0;
}

Switches.prototype.bindHandlers = function(addrControl) {
	var self = this;
	this._simulator._ioc.registerReadHandler(addrControl || 0xfff9, function() {
		return self._value;
	});
}

Switches.prototype.set = function(i) {
	this._value |= (1 << i);
}

Switches.prototype.unset = function(i) {
	this._value &= ~(1 << i);
}

Switches.prototype.toggle = function(i) {
	this._value ^= (1 << i);
}

Switches.prototype.reset = function() {
	this._value = 0;
}
