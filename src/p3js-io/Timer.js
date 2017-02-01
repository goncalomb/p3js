var Timer = module.exports = function(simulator, int) {
	this._simulator = simulator;
	int = (int === undefined ? 15 : int);
	this._value = 0;
	this._state = 0;
	this._interval = 0;

	var self = this;

	this._timerFn = (function() {
		if (self._value <= 0) {
			self._control(0);
			simulator.interrupt(int);
		} else {
			self._value--;
		}
	});
}

Timer.prototype._control = function(v) {
	if ((v & 0x1) == 0) {
		clearInterval(this._interval);
		this._state = 0;
		this._interval = 0;
	} else if (this._state == 0) {
		this._state = 1;
		this._interval = setInterval(this._timerFn, 100);
	}
}

Timer.prototype.bindHandlers = function(addrValue, addrControl) {
	var self = this;
	this._simulator._ioc.registerReadHandler(addrValue || 0xfff6, function() {
		return self._value;
	});
	this._simulator._ioc.registerReadHandler(addrControl || 0xfff7, function() {
		return self._state;
	});
	this._simulator._ioc.registerWriteHandler(addrValue || 0xfff6, function(value) {
		self._value = value;
	});
	this._simulator._ioc.registerWriteHandler(addrControl || 0xfff7, function(value) {
		self._control(value);
	});
}

Timer.prototype.reset = function() {
	this._value = 0;
	this._control(0);
}
