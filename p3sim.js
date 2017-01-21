var fs = require("fs");
var termui = require("./src/termui.js");
var p3js = require("./src/p3js/p3js.js");

var p3sim = new p3js.Simulator();

if (!process.stdin.isTTY || !process.stdout.isTTY) {
	process.stdout.write("no TTY");
}

var timer = new (require("./src/p3js-web/IOTimer.js"))(p3sim);

p3sim.registerEventHandler("reset", function() {
	timer.reset();
});

p3sim.setIOHandlers({
	0xfff6: function() { return timer.getValue(); },
	0xfff7: function() { return timer.state(); },
	0xfff9: function() { return termui.getSwitches(); },
	0xfffd: function() {
		return (termui.peekLastKey() ? 1 : 0);
	},
	0xffff: function() {
		return termui.getLastKey();
	}
}, {
	0xfff0: function(v) { termui.set7Seg(v & 0xf, 0xfff0); },
	0xfff1: function(v) { termui.set7Seg((v & 0xf) << 4, 0xff0f); },
	0xfff2: function(v) { termui.set7Seg((v & 0xf) << 8, 0xf0ff); },
	0xfff3: function(v) { termui.set7Seg((v & 0xf) << 12, 0x0fff); },
	0xfff6: function(v) { timer.setValue(v); },
	0xfff7: function(v) { timer.control(v); },
	0xfff8: function(v) { termui.setLeds(v); },
	0xfffc: function(v) {
		var x = v & 0xff;
		var y = v >> 8 & 0xff;
		termui.move(x, y);
	},
	0xfffe: function(v) {
		termui.putChar(v);
	}
});

if (typeof process.argv[2] != "undefined") {
	termui.initialize(p3sim);
	fs.readFile(process.argv[2], "utf8", function (err, data) {
		var result = p3js.assembly.assembleWithDefaultValidator(data);
		p3sim.loadMemory(result.buffer);
		p3sim.start();
	});
} else {
	console.log("No input file.");
}
