$(window).ready(function() {

	var $code = $("#code");
	var $load_demo = $("#load-demo")
	var $output = $("#output");
	var $assemble = $("#assemble");
	var $assemble_run = $("#assemble-run");
	var $assemble_dl = $("#assemble-dl");

	var demos = [
		// "welcome.as",
		"Demo1-clean.as"
	];
	demos.forEach(function(demo) {
		$load_demo.append($("<option>").val(demo).text(demo));
	});
	function load_demo(demo) {
		// Loading local files (file://) with jQuery may not work. Use:
		// google-chrome --user-data-dir=$(mktemp -d) --incognito --allow-file-access-from-files --start-maximized
		// Or use Firefox.
		$.get("demos/" + demo, null, function(data) {
			$code.val(data);
		}, "text");
	}
	$load_demo.change(function() {
		var demo = $("option:selected", this).val();
		load_demo(demo)
	});
	load_demo(demos[0]);

	function try_assemble() {
		try {
			var data = p3js.parser.parseString($code.val());
			var buffer = p3js.assembler.assembleData(data);
			$output.val("Done.");
			return buffer;
		} catch (e) {
			$output.val(e);
			console.error(e);
		}
		return null;
	}

	$assemble.click(function() {
		try_assemble()
	});

	$assemble_run.click(function() {
		alert("Not Implemented");
	});

	$assemble_dl.click(function() {
		alert("Not Implemented");
	});

	$output.val("Initialized.\n");

});
