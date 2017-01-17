var fs = require("fs");
var p3js = require("./src/p3js/p3js.js");

var p3sim = new p3js.Simulator();

if (!process.stdin.isTTY || !process.stdout.isTTY) {
	process.stdout.write("no TTY");
}

var tty_is_clean = true;
var tty_last_key = 0;

function tty_initialize() {
	process.stdin.setRawMode(true);
	//process.stdin.setEncoding("utf-8");
	process.stdout.write("\x1b[?1049h"); // alternative buffer
	process.stdout.write("\x1b[8;24;80t"); // resize
	process.stdout.write("\x1b[?25l"); // hide cursor
	process.stdout.write("\x1b[2J"); // clear

	process.stdin.on("data", function(chunk) {
		if (chunk == "\u0003") {
			process.exit();
		} else {
			tty_last_key = chunk.toString().charCodeAt(0);
		}
	});

	tty_is_clean = false;
}

function tty_cleanup() {
	if (!tty_is_clean) {
		process.stdout.write("\x1b[2J"); // clear
		process.stdout.write("\x1b[?25h"); // show cursor
		process.stdout.write("\x1b[?1049l"); // normal buffer
		tty_is_clean = true;
	}
	process.exit();
}

process.once("SIGTERM", tty_cleanup);
process.once("SIGINT", tty_cleanup);
process.once("exit", tty_cleanup);

var IOTerminal = require("./src/p3js-web/IOTerminal.js");
var fake_IOTerminal = { constructor: IOTerminal };
var fromCharCode = function() {
	return IOTerminal.prototype._charFromCode.apply(fake_IOTerminal, arguments);
}

p3sim.setIOHandlers({
	0xfffd: function() {
		return (tty_last_key ? 1 : 0);
	},
	0xffff: function() {
		var k = tty_last_key;
		tty_last_key = 0;
		return k;
	}
}, {
	0xfffc: function(v) {
		var x = v & 0xff;
		var y = v >> 8 & 0xff;
		process.stdout.write("\x1b[" + (y + 1) + ";" + (x + 1) + "H");
	},
	0xfffe: function(v) {
		process.stdout.write(fromCharCode(v));
	}
});

if (typeof process.argv[2] != "undefined") {
	tty_initialize();
	fs.readFile(process.argv[2], "utf8", function (err, data) {
		var result = p3js.assembly.assembleWithDefaultValidator(data);
		p3sim.loadMemory(result.buffer);
		p3sim.start();
	});
} else {
	console.log("No input file.");
}
