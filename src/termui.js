var blessed = require("blessed");
var program = blessed.program();

var termui = module.exports = { };
var last_key = 0;

termui.initialize = function() {
	program.alternateBuffer();
	process.stdout.write("\x1b[8;24;80t"); // resize
	program.hideCursor();
	program.clear();
	program.on("keypress", function(chunk) {
		if (chunk == "\u0003") {
			process.exit();
		} else {
			last_key = chunk.toString().charCodeAt(0);
		}
	});
	process.once("SIGTERM", termui.dispose);
	process.once("SIGINT", termui.dispose);
	process.once("exit", termui.dispose);
}

termui.move = function(x, y) {
	program.cursorPos(y, x);
}

termui.write = function(text) {
	program.write(text);
}

termui.peekLastKey = function() {
	return last_key;
}

termui.getLastKey = function() {
	var k = last_key;
	last_key = 0;
	return k;
}

termui.dispose = function() {
	process.removeListener("exit", termui.dispose);
	program.clear();
	program.showCursor();
	program.normalBuffer();
	process.exit();
}
