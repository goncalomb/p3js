var IOTerminal = module.exports = function(p3sim) {
	this._$wrapper = $("#io-terminal-wrapper");
	this._$content = $("#io-terminal");

	var self = this;

	p3sim.io.terminal.onClear(function(buffer, cursorMode) {
		self._$content.text("");
	});
	p3sim.io.terminal.onTextChange(function(buffer, cursorMode, x, y, v, c, lf) {
		self._$content.text(buffer.join("\n"));
	});

	this._$wrapper.on("keypress", function(e) {
		e.preventDefault();
		if (p3sim.isRunning()) {
			if (e.which == 13) {
				p3sim.io.terminal.sendKey(10) // send ENTER as LF insted of CR
			} else {
				p3sim.io.terminal.sendKey(e.which);
			}
		}
	});
	this._$wrapper.on("keydown", function(e) {
		if (e.which == 8 || e.which == 27) { // BS and ESC
			e.preventDefault();
			if (p3sim.isRunning()) {
				p3sim.io.terminal.sendKey(e.which);
			}
		}
	});
}
