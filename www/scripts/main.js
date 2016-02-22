$(window).ready(function() {

	var $code = $("#code");
	var $output = $("#output");
	var $run = $("#run");
	var $hex = $("#hex");

	// Loading local files (file://) with jQuery may not work. Use:
	// google-chrome --user-data-dir=$(mktemp -d) --incognito --allow-file-access-from-files --start-maximized
	// Or use Firefox.
	$.get("demos/Demo1-clean.as", null, function(data) {
		$code.val(data);
		$run.click();
	}, "text");

	function debug_write_hex(buffer) {
		var str = [ ];
		var data = new Uint8Array(buffer);
		data.forEach(function(v) {
			var s = v.toString(16);
			if (s.length < 2) {
				s = "0" + s;
			}
			str.push(s);
		});
		$hex.val(str.join(" "));
	}

	$run.click(function() {
		try {
			var data = p3js.parser.parseString($code.val());
			var buffer = p3js.assembler.assembleData(data);
			// debug
			$output.val(JSON.stringify(data, null, 1));
			debug_write_hex(buffer);
		} catch (e) {
			$hex.val(e);
			$output.val(e);
		}
	});

	$output.val("Initialized\n");

});
