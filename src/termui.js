var blessed = require("blessed");
var program = blessed.program();

var termui = module.exports = { };

var focus = 0;
var seg7, lcd, timer, leds, switches, terminal;

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
	var swt_str = ("00000000" + switches._value.toString(2)).substr(-8);
	program.write(": " + swt_str.substr(0, 4) + " " + swt_str.substr(4));
	program.move(72, 4);
	if (focus == 0) { program.bg("blue"); }
	program.write("TERM");
	if (focus == 0) { program.bg("!blue"); }
}

function draw_7seg() {
	program.move(28, 4);
	program.write("7SEG: " + ("0000" + seg7._value.toString(16)).substr(-4));
}

function draw_lcd() {
	program.move(9, 3);
	program.bg("green");
	if (lcd._active && lcd._text) {
		program.write(program.text(lcd._text[0], "bold"));
	} else {
		program.write("                ");
	}
	program.move(9, 4);
	if (lcd._active && lcd._text) {
		program.write(program.text(lcd._text[1], "bold"));
	} else {
		program.write("                ");
	}
	program.bg("!green");
}

function draw_leds() {
	program.move(28, 3);
	var leds_str = ("0000000000000000" + leds._value.toString(2)).substr(-16);
	program.write("LEDS: " + leds_str.substr(0, 4) + " " + leds_str.substr(4, 4) + " " + leds_str.substr(8, 4) + " " + leds_str.substr(12));
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
		switches.toggle(i);
		//draw_inputs();
		var ii = 61 + (i < 4 ? 8 : 7) - i;
		program.move(ii, 4);
		program.bg("red");
		program.write(((switches._value >> i) & 1).toString());
		program.bg("!red");
		setTimeout(function() {
			program.move(ii, 4);
			program.write(((switches._value >> i) & 1).toString());
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
			terminal.sendKey(c);
		}
	});
	process.once("SIGTERM", termui.dispose);
	process.once("SIGINT", termui.dispose);
	process.once("exit", termui.dispose);

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

	seg7 = new (require("./p3js-io/Seg7Display.js"))(p3sim);
	seg7.bindHandlers();
	seg7.onStateChange(draw_7seg);

	lcd = new (require("./p3js-io/LCD.js"))(p3sim);
	lcd.bindHandlers();
	lcd.onStateChange(draw_lcd);
	lcd.onTextChange(draw_lcd);

	timer = new (require("./p3js-io/Timer.js"))(p3sim);
	timer.bindHandlers();

	leds = new (require("./p3js-io/Leds.js"))(p3sim);
	leds.bindHandlers();
	leds.onStateChange(draw_leds);

	switches = new (require("./p3js-io/Switches.js"))(p3sim);
	switches.bindHandlers();

	terminal = new (require("./p3js-io/Terminal.js"))(p3sim);
	terminal.bindHandlers();
	terminal.onClear(function(buffer, cursorMode) {
		for (var i = 0; i < 24; i++) {
			program.cursorPos(i + 6, 0);
			program.eraseInLine("right");
		}
	});
	terminal.onTextChange(function(buffer, cursorMode, x, y, v, c, lf) {
		if (cursorMode) {
			// cursor mode, just write the character at the right position
			program.cursorPos(y + 6, x);
			program.write(c);
		} else if (buffer.length < 25 || !lf) {
			// buffer is small or we don't need full repaint (not a line feed)
			// find the last character and write it at the right position
			var val = buffer[buffer.length - 1];
			// check for empty line (line feed with nothing to write)
			if (val.length) {
				program.cursorPos((buffer.length < 24 ? buffer.length - 1 : 23) + 6, val.length - 1);
				program.write(val.substr(-1));
			}
		} else {
			// buffer is big (more than 24 lines) and line feed
			// we need to repaint the screen (scroll one line)
			for (var i = 0, j = buffer.length - 24; i < 24; i++, j++) {
				program.cursorPos(i + 6, 0);
				program.eraseInLine("right");
				program.write(buffer[j]);
			}
		}
	});

	this.drawHeader();
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
	draw_lcd();
	put_char(26, 2, 0x252c);
	put_char(26, 3, 0x2502);
	put_char(26, 4, 0x2502);
	put_char(26, 5, 0x2534);
	draw_leds();
	draw_7seg();
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

termui.dispose = function() {
	process.removeListener("exit", termui.dispose);
	program.clear();
	program.showCursor();
	program.normalBuffer();
	process.exit();
}
