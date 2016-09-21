var fs = require("fs");
var path = require("path");

var p3js = require("./src/p3js/p3js");

if (typeof process.argv[2] != "undefined") {
	var input_file = process.argv[2];
	if (input_file.slice(-3) != ".as") {
		console.log("The input file must use the .as extension.");
	} else {
		fs.readFile(input_file, "utf8", function (err, data) {
			if (err) {
				return console.log(err);
			}
			var output_file = input_file.slice(0, -3) + ".exe";
			console.log("Assembling '" + input_file + "'...");
			try {
				var data = p3js.parser.parseString(data);
				var result = p3js.assembler.assembleData(data, p3js.assembler.DEFAULT_VALIDATOR);
				var buffer = p3js.writeObjectFormat(result.buffer, false, result.usedAddresses);
			} catch (e) {
				console.log(e);
			}
			console.log("Writing to '" + output_file + "'...");
			fs.writeFileSync(output_file, new Buffer(new Uint8Array(buffer)));
			console.log("Done.");
		});
	}
} else {
	console.log("No input file.");
}
