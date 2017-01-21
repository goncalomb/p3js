var blessed = require("blessed");
var program = blessed.program();

var termui = module.exports = { };
var last_key = 0;
var term_cur_x = 0;
var term_cur_y = 0;

var focus = 0;
var switches_value = 0;

function hex_key_to_int(c) {
	if (c >= 48 && c <= 57) {
		return c - 48;
	} else if (c >= 65 && c <= 70) {
		return c - 65 + 10;
	} else if (c >= 97 && c <= 102) {
		return c - 97 + 10;
	}
	return -1;
}

function draw_inputs() {
	program.move(56, 3);
	if (focus == 1) { program.bg("blue"); }
	program.write("INT");
	if (focus == 1) { program.bg("!blue"); }
	program.write(": 0123456789ABCDE");
	program.move(56, 4);
	if (focus == 2) { program.bg("blue"); }
	program.write("SWT");
	if (focus == 2) { program.bg("!blue"); }
	var swt_str = ("00000000" + switches_value.toString(2)).substr(-8);
	program.write(": " + swt_str.substr(0, 4) + " " + swt_str.substr(4));
	program.move(72, 4);
	if (focus == 0) { program.bg("blue"); }
	program.write("TERM");
	if (focus == 0) { program.bg("!blue"); }
}

function next_focus() {
	focus = (focus + 1)%3;
	draw_inputs();
}

function trigger_interrupt(c, p3sim) {
	var i = hex_key_to_int(c);
	if (i != -1) {
		p3sim.interrupt(i);
		program.move(61 + i, 3);
		program.bg("red");
		program.write(String.fromCharCode(c).toUpperCase());
		program.bg("!red");
		setTimeout(function() {
			program.move(61 + i, 3);
			program.write(String.fromCharCode(c).toUpperCase());
		}, 100);
	}
}

function set_switches(c) {
	var i = hex_key_to_int(c);
	if (i != -1 && i < 8) {
		switches_value ^= (1 << i);
		//draw_inputs();
		var ii = 61 + (i < 4 ? 8 : 7) - i;
		program.move(ii, 4);
		program.bg("red");
		program.write(((switches_value >> i) & 1).toString());
		program.bg("!red");
		setTimeout(function() {
			program.move(ii, 4);
			program.write(((switches_value >> i) & 1).toString());
		}, 100);
	}
}

termui.initialize = function(p3sim) {
	program.alternateBuffer();
	process.stdout.write("\x1b[8;30;80t"); // resize
	program.hideCursor();
	program.clear();
	program.on("keypress", function(data, k) {
		if (k.sequence && k.sequence.length > 1) {
			return; // exclude special keys
		}
		var c = (k.sequence || k.ch).charCodeAt(0);
		if (c == 1) { // Ctrl-A
			next_focus();
		} else if (c == 3) { // Ctrl-C
			process.exit();
		} else if (c == 18) { // Ctrl-R
			p3sim.reset();
		} else if (c == 19) { // Ctrl-S
			if (p3sim.isRunning()) {
				p3sim.stop();
			} else {
				p3sim.start();
			}
		} else if (k.ctrl) {
			return; // exclude other special keys
		} else if (focus == 1) {
			trigger_interrupt(c, p3sim);
		} else if (focus == 2) {
			set_switches(c);
		} else {
			last_key = c;
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
	draw_inputs();
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

termui.getSwitches = function() {
	return switches_value;
}

termui.dispose = function() {
	process.removeListener("exit", termui.dispose);
	program.clear();
	program.showCursor();
	program.normalBuffer();
	process.exit();
}
