var fs = require("fs");
var termui = require("./src/termui.js");
var p3js = require("./src/p3js/p3js.js");

var p3sim = new p3js.Simulator();

if (!process.stdin.isTTY || !process.stdout.isTTY) {
	process.stdout.write("no TTY");
}

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
