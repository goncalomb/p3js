var fs = require("fs");
var path = require("path");

var termui = require("./src/termui.js");
var p3js = require("./src/p3js/");

var argv = require("minimist")(process.argv.slice(2), {
	unknown: function(opt) {
		if (opt[0] == '-') {
			console.error("Unknown option '" + opt + "'.");
			process.exit(1);
			return false;
		}
	}
});

var p3sim = new p3js.SimulatorWithIO();

if (!process.stdin.isTTY || !process.stdout.isTTY) {
	console.error("Not connected to a tty.");
	process.exit(2);
}

if (typeof argv._[0] == "undefined") {
	console.error("No input file.");
	process.exit(3);
}

try {
	var data = fs.readFileSync(path.normalize(argv._[0]), "utf8");
} catch (e) {
	console.error(e.message);
	process.exit(4);
}

try {
	var result = p3js.assembly.assembleWithDefaultValidator(data);
} catch (e) {
	console.error("Assembly Error: " + e);
	process.exit(5);
}

termui.initialize(p3sim);
p3sim.loadMemory(result.buffer);
p3sim.start();
