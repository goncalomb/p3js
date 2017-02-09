var TextAreaTerminal = module.exports = function($container, p3sim) {
	$container.addClass("p3js-io-terminal").attr("tabindex", "0");
	var $scroll = $("<div class=\"p3js-io-terminal-scroll\">").appendTo($container);
	var $content = $("<div class=\"p3js-io-terminal-content\">").appendTo($scroll);

	p3sim.io.terminal.onClear(function(buffer, cursorMode) {
		$content.text("");
	});
	p3sim.io.terminal.onTextChange(function(buffer, cursorMode, x, y, v, c, lf) {
		$content.text(buffer.join("\n"));
	});

	$container.on("keypress", function(e) {
		e.preventDefault();
		if (p3sim.isRunning()) {
			if (e.which == 13) {
				p3sim.io.terminal.sendKey(10) // send ENTER as LF insted of CR
			} else {
				p3sim.io.terminal.sendKey(e.which);
			}
		}
	});
	$container.on("keydown", function(e) {
		if (e.which == 8 || e.which == 27) { // BS and ESC
			e.preventDefault();
			if (p3sim.isRunning()) {
				p3sim.io.terminal.sendKey(e.which);
			}
		}
	});
}
