var fs = require("fs");
var path = require("path");

var p3js = require("./src/p3js/");

var argv = require("minimist")(process.argv.slice(2), {
	string: ["o"],
	boolean: ["show-refs"],
	unknown: function(opt) {
		if (opt[0] == '-') {
			console.log("Unknown option '" + opt + "'.");
			process.exit(1);
			return false;
		}
	}
});

if (typeof argv._[0] == "undefined") {
	console.log("No input file.");
	process.exit(2);
}

var input_file = path.normalize(argv._[0]);
var path_parts = path.parse(input_file);
var output_file = path.join(path_parts.dir, path_parts.name + ".exe");

if (typeof argv.o == "string") {
	output_file = path.normalize(argv.o);
}

try {
	var data = fs.readFileSync(input_file, "utf8");
} catch (e) {
	console.error(e.message);
	process.exit(3);
}

console.log("Assembling '" + input_file + "'...");
try {
	var result = p3js.assembly.assembleWithDefaultValidator(data);
	var buffer = p3js.writeObjectFormat(result.buffer, false, result.usedAddresses);
} catch (e) {
	console.error("Assembly Error: " + e);
	process.exit(4);
}

console.log("Statistics:");
console.log("  References: " + result.labelCount);
console.log("  Pseudo Instructions: " + result.pseudoCount);
console.log("  Instructions: " + result.instructionCount);
var memory_percent = Math.floor(result.memoryUsage*10000/p3js.devices.RAM.MEMORY_SIZE)/100;
console.log("  Memory: " + result.memoryUsage + "/" + p3js.devices.RAM.MEMORY_SIZE + " (" + memory_percent + "%)");

if (argv["show-refs"]) {
	console.log("References:");
	Object.keys(result.labels).forEach(function(name) {
		console.log("  " + name + ": " +  ("0000" + result.labels[name].toString(16)).substr(-4));
	});
}

console.log("Writing program to '" + output_file + "'...");
try {
	fs.writeFileSync(output_file, new Buffer(new Uint8Array(buffer)));
} catch (e) {
	console.error(e.message);
	process.exit(5);
}

console.log("Done.");
