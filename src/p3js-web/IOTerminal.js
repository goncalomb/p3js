var IOTerminal = module.exports = function(p3sim) {
	this._$wrapper = $("#io-terminal-wrapper");
	this._$content = $("#io-terminal");

	var self = this;

	this._terminal = new (require("../p3js-io/Terminal.js"))(p3sim);
	this._terminal.bindHandlers();
	this._terminal.onClear(function(buffer, cursorMode) {
		self._$content.text("");
	});
	this._terminal.onTextChange(function(buffer, cursorMode, x, y, v, c, lf) {
		self._$content.text(buffer.join("\n"));
	});

	this._$wrapper.on("keypress", function(e) {
		e.preventDefault();
		if (p3sim.isRunning()) {
			if (e.which == 13) {
				self._terminal.sendKey(10) // send ENTER as LF insted of CR
			} else {
				self._terminal.sendKey(e.which);
			}
		}
	});
	this._$wrapper.on("keydown", function(e) {
		if (e.which == 8 || e.which == 27) { // BS and ESC
			e.preventDefault();
			if (p3sim.isRunning()) {
				self._terminal.sendKey(e.which);
			}
		}
	});
}

IOTerminal.prototype.reset = function() {
	this._terminal.reset();
}
