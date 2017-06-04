var ROMReaderWriter = module.exports = function(simulator, n) {
	this._simulator = simulator;
	this.c = String.fromCharCode(65 + n)
	this.size = p3js.devices.CPU["ROM_" + this.c + "_SIZE"];
	this.wordLength = p3js.devices.CPU["ROM_" + this.c + "_WORD_LENGTH"];
}

ROMReaderWriter._parseROMValues = function(text, k_limit, v_limit) {
	var values = [];
	var regex = /^0*([0-9a-f]{1,16})\s+0*([0-9a-f]{1,16})(?:\s*#|$)/i;
	var lines = text.split("\n");
	for (var i = 0, l = lines.length; i < l; i++) {
		var line = lines[i].trim();
		if (line.length == 0 || line[0] == "#") continue;
		var matches = line.match(regex);
		if (matches) {
			var k = parseInt(matches[1], 16);
			if (k < 0 || k > k_limit) {
				throw "Invalid index " + matches[1] + " expecting 0 to " + k_limit.toString(16) + " (hex), on line " + (i + 1);
			}
			if (values[k] !== undefined) {
				throw "Duplicate index " + matches[1] + ", on line " + (i + 1);
			}
			var v = parseInt(matches[2], 16);
			if (v < 0 || v > v_limit) {
				throw "Invalid value " + matches[2] + " expecting 0 to " + v_limit.toString(16) + " (hex), on line " + (i + 1);
			}
			values[k] = v;
		} else {
			throw "Syntax error, on line " + (i + 1);
		}
	}
	return values;
}

ROMReaderWriter._dumpROMValues = function(data, pad_value) {
	var pad_key = Math.ceil(Math.log2(data.length)/4);
	var str = [];
	var zeros = Array(11).join("0");
	for (var i = 0, l = data.length; i < l; i++) {
		str.push((zeros + i.toString(16)).substr(-pad_key) + " " + (zeros + data[i].toString(16)).substr(-pad_value));
	}
	return str.join("\n");
}

ROMReaderWriter.prototype.dumpROMContents = function() {
	return this.constructor._dumpROMValues(this._simulator._cpu["_rom" + this.c], Math.ceil(this.wordLength/4));
}

ROMReaderWriter.prototype.overwriteROMContents = function(string) {
	var new_values = this.constructor._parseROMValues(string, this.size - 1, Math.pow(2, this.wordLength) - 1);
	this._simulator.stop();
	this._simulator._cpu["resetRom" + this.c]();
	var data = this._simulator._cpu["_rom" + this.c];
	for (k in new_values) {
		data[k] = new_values[k];
	}
}
