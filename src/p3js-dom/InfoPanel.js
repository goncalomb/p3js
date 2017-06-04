var InfoPanel = module.exports = function(simulator, $textarea) {
	this._simulator = simulator;
	this._$textarea = $textarea;

	var self = this;

	simulator.registerEventHandler("stop", function(c, i, s) {
		self._update(c, i, s);
	});
	simulator.registerEventHandler("clock", function(c, i, s) {
		self._update(c, i, s);
	});
	simulator.registerEventHandler("reset", function() {
		self._update(0, 0, 0);
	});

	this._update(0, 0, 0);
}

InfoPanel.prototype._update = function(c, i, s) {
	var s_str;
	if (s >= 1000000) {
		s_str = Math.round(s/100000)/10 + " MHz";
	} else if (s >= 1000) {
		s_str = Math.round(s/100)/10 + " kHz";
	} else {
		s_str = Math.round(s*10)/10 + " Hz";
	}
	this._$textarea.html(
		"Speed: " + s_str + "\n" +
		"Clock: " + c.toLocaleString() + "\n" +
		"Instructions: " + i.toLocaleString() + "\n"
	);
}
