(function() {

	var p3js = window.p3js = (window.p3js || { });
	var parser = p3js.parser = { };

	function process_line(text, n) {
		var data = { n: n, l: null, i: null, c: null, o: [ ] };
		// n: line #; l: label; i: instruction; c: condition; o: operands;
		var matches = text.match(/^\s*(?:([a-z_]\w*)(?:\s+|\s*(:)\s*))?([a-z]+)(?:\s*\.\s*([a-z]+))?(?:\s+(.*?)\s*)?$/i);
		// 1: label; 2: colon; 3: instruction; 4: condition; 5: operands;
		if (!matches) {
			throw "Syntax error on line " + n;
		} else if (!matches[3]) {
			// should not happen
			throw "Oops, the parser has a bug, on line " + n;
		}

		// process label
		if (matches[1]) {
			var lower = matches[1].toLowerCase();
			if (p3js.pseudoInstructions[lower] || p3js.instructions[lower]) {
				// found label with instruction name, investigate
				if (matches[2] || matches[4] || matches[5]) {
					// dont allow labels with instruction names
					throw "Syntax error, invalid label, on line " + n;
				} else {
					// a simple instruction like 'JMP SomeLabel' will only use match group 1 and 3
					// with these instructions the label match group is the instruction
					// the operators are on the instruction match group
					matches[5] = matches[3];
					matches[3] = matches[1];
					matches[1] = undefined;
				}
			} else {
				data.l = matches[1]; // store label
			}
		}

		// process instruction
		data.i = matches[3].toLowerCase() + (matches[4] ? "." : ""); // store instruction
		if (p3js.instructions[data.i]) {
			if (data.l && !matches[2]) {
				throw "Syntax error, invalid label (missing colon?), on line " + n;
			} else if (matches[4]) {
				// conditional instruction
				data.c = matches[4].toLowerCase(); // store condition
				if (!p3js.conditions[data.c]) {
					throw "Syntax error, invalid condition, on line " + n;
				}
			}
		} else if (p3js.pseudoInstructions[data.i]) {
			if (data.i == "equ" || data.i == "str") {
				if (!data.l || matches[2]) {
					throw "Syntax error, invalid label, on line " + n;
				}
			} else if (data.l) {
				throw "Syntax error, '" + data.i + "' cannot have a label, on line " + n;
			}
		} else {
			throw "Syntax error, invalid instruction, on line " + n;
		}

		// process operands
		// TODO: do process the operands
		data.o = (matches[5] ? matches[5] : null); // remove this

		// debug code
		return text.trim() + "\n" + JSON.stringify(data, null, 2) + "\n";
		// return data;
	}

	parser.parseString = function(text) {
		var data = [];
		var n = 1;
		var inside_comment = false;
		var inside_string = false;
		for (var line = "", i = 0, l = text.length; i < l; i++) {
			var c = text.charAt(i);
			if (c == "\n") {
				if (line && line.trim()) {
					data.push(process_line(line, n));
				}
				line = "";
				n++;
				inside_comment = false;
				inside_string = false;
			} else if (inside_comment) {
				// Do nothing!
			} else if (c == ";" && !inside_string) {
				inside_comment = true;
			} else {
				if (c == "'") {
					inside_string = !inside_string;
				}
				line += c;
			}
		}
		if (line && line.trim()) {
			data.push(process_line(line, n));
		}
		return data;
	};

})();
