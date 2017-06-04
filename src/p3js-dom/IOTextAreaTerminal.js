var TextAreaTerminal = module.exports = function($container, simulator) {
	$container.addClass("p3js-io-terminal").attr("tabindex", "0");
	var $scroll = $("<div class=\"p3js-io-terminal-scroll\">").appendTo($container);
	var $content = $("<div class=\"p3js-io-terminal-content\">").appendTo($scroll);

	simulator.io.terminal.onClear(function(buffer, cursorMode) {
		$content.text("");
	});
	simulator.io.terminal.onTextChange(function(buffer, cursorMode, x, y, v, c, lf) {
		$content.text(buffer.join("\n"));
	});

	$container.on("keypress", function(e) {
		e.preventDefault();
		if (simulator.isRunning()) {
			if (e.which == 13) {
				simulator.io.terminal.sendKey(10) // send ENTER as LF insted of CR
			} else {
				simulator.io.terminal.sendKey(e.which);
			}
		}
	});
	$container.on("keydown", function(e) {
		if (e.which == 8 || e.which == 27) { // BS and ESC
			e.preventDefault();
			if (simulator.isRunning()) {
				simulator.io.terminal.sendKey(e.which);
			}
		}
	});
}
