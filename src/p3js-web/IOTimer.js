var IOTimer = module.exports = function(p3sim) {
	this._value = 0;
	this._state = 0;
	this._interval = 0;

	var self = this;

	this._timerFn = (function() {
		if (self._value <= 0) {
			self.control(0);
			p3sim.interrupt(15);
		} else {
			this._value--;
		}
	});
}

IOTimer.prototype.reset = function() {
	this._value = 0;
	this.control(0);
}

IOTimer.prototype.getValue = function() {
	return this._value;
}

IOTimer.prototype.setValue = function(v) {
	this._value = v;
}

IOTimer.prototype.state = function() {
	return this._state;
}

IOTimer.prototype.control = function(v) {
	if ((v & 0x1) == 0) {
		clearInterval(this._interval);
		this._state = 0;
		this._interval = 0;
	} else if (this._state == 0) {
		this._state = 1;
		this._interval = setInterval(this._timerFn, 100);
	}
}
