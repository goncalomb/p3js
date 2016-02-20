(function() {

	var p3js = window.p3js = (window.p3js || { });
	var parser = p3js.parser = { };

	function process_line(line, n) {
		return line;
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
