var fs = require("fs");
var termui = require("./src/termui.js");
var p3js = require("./src/p3js/p3js.js");

var p3sim = new p3js.Simulator();

if (!process.stdin.isTTY || !process.stdout.isTTY) {
	process.stdout.write("no TTY");
}

var IOTerminal = require("./src/p3js-web/IOTerminal.js");
var fake_IOTerminal = { constructor: IOTerminal };
var fromCharCode = function() {
	return IOTerminal.prototype._charFromCode.apply(fake_IOTerminal, arguments);
}

p3sim.setIOHandlers({
	0xfffd: function() {
		return (termui.peekLastKey() ? 1 : 0);
	},
	0xffff: function() {
		return termui.getLastKey();
	}
}, {
	0xfffc: function(v) {
		var x = v & 0xff;
		var y = v >> 8 & 0xff;
		termui.move(x, y);
	},
	0xfffe: function(v) {
		termui.write(fromCharCode(v));
	}
});

if (typeof process.argv[2] != "undefined") {
	termui.initialize();
	fs.readFile(process.argv[2], "utf8", function (err, data) {
		var result = p3js.assembly.assembleWithDefaultValidator(data);
		p3sim.loadMemory(result.buffer);
		p3sim.start();
	});
} else {
	console.log("No input file.");
}
