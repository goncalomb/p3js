$(window).ready(function() {

	var $code = $("#code");
	var $output = $("#output");
	var $run = $("#run");

	// Loading local files (file://) with jQuery may not work. Use:
	// google-chrome --user-data-dir=$(mktemp -d) --incognito --allow-file-access-from-files --start-maximized
	// Or use Firefox.
	$.get("demos/Demo1.as", null, function(data) {
		$code.val(data);
	}, "text");

	$run.click(function() {
		try {
			var data = p3js.parser.parseString($code.val());
			var str = [];
			for (var i = 0, l = data.length; i < l; i++) {
				str.push(JSON.stringify(data[i]));
			}
			$output.val(str.join("\n") + "\n");
		} catch (e) {
			$output.val(e);
		}
	});

	$output.val("Initialized\n");

});
