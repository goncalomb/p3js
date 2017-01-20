var blessed = require("blessed");
var program = blessed.program();

var termui = module.exports = { };
var last_key = 0;
var term_cur_x = 0;
var term_cur_y = 0;

termui.initialize = function(p3sim) {
	program.alternateBuffer();
	process.stdout.write("\x1b[8;30;80t"); // resize
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

	this.drawHeader();

	p3sim.registerEventHandler("clock", function(c, i, s) {
		var s_str;
		if (s >= 1000000) {
			s_str = Math.round(s/100000)/10 + " MHz";
		} else if (s >= 1000) {
			s_str = Math.round(s/100)/10 + " kHz";
		} else {
			s_str = Math.round(s*10)/10 + " Hz";
		}
		program.move(32, 1);
		program.eraseInLine("right");
		program.write(s_str);
		program.move(48, 1);
		program.write("c: " + c);
		program.move(64, 1);
		program.write("i: " + i);
	});
}

termui.drawHeader = function() {
	var hr = "\u2500".repeat(80);
	for (var i = 0; i < 6; i++) {
		program.move(0, i);
		program.eraseInLine("right");
		if (i == 0 || i == 2 || i == 5) {
			program.write(hr);
		}
	}
	function put_char(x, y, c) {
		program.move(x, y);
		program.write(String.fromCharCode(c));
	}
	program.move(1, 1);
	program.write(program.text("P3JS Simulator", "bold"));
	put_char(2, 2, 0x252c);
	put_char(2, 3, 0x2502);
	put_char(2, 4, 0x2502);
	put_char(2, 5, 0x2534);
	program.move(4, 3);
	program.write("LCD:");
	program.move(9, 3);
	program.bg("green");
	program.write("                ");
	program.move(9, 4);
	program.write("                ");
	program.bg("!green");
	put_char(26, 2, 0x252c);
	put_char(26, 3, 0x2502);
	put_char(26, 4, 0x2502);
	put_char(26, 5, 0x2534);
	program.move(28, 3);
	program.write("LEDS: 0000 0000 0000 0000");
	program.move(28, 4);
	program.write("7SEG: 0000");
	put_char(54, 2, 0x252c);
	put_char(54, 3, 0x2502);
	put_char(54, 4, 0x2502);
	put_char(54, 5, 0x2534);
	program.move(56, 3);
	program.write("INT: 0123456789ABCDE");
	program.move(56, 4);
	program.write("SWT: 0000 0000");
	put_char(77, 2, 0x252c);
	put_char(77, 3, 0x2502);
	put_char(77, 4, 0x2502);
	put_char(77, 5, 0x2534);
}

termui.move = function(x, y) {
	term_cur_x = x;
	term_cur_y = y;
}

termui.putChar = function(code) {
	program.cursorPos(term_cur_y + 6, term_cur_x);
	if (code == 10) {
		program.write("\n");
	} else if (code < 0x20 || (code >= 0x7f && code <= 0xa0) || code == 0xad || code > 0xff) {
		program.write("\ufffd");
	} else {
		program.write(String.fromCharCode(code));
	}
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
