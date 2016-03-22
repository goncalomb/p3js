module.exports = function(share, p3sim) {

	var $document = $(document);

	var $load_demo = $("#load-demo")
	var $output = $("#output");
	var $assemble = $("#assemble");
	var $assemble_run = $("#assemble-run");
	var $assemble_dl = $("#assemble-dl");

	// editor
	var $code = $("#code");
	var code_mirror = CodeMirror.fromTextArea($code[0], {
		lineNumbers: true,
		indentUnit: 4,
		extraKeys: {
			Tab: function(cm) {
				var selections = cm.listSelections();
				var strings = [];
				for (var i = 0, l = selections.length; i < l; i++) {
					var p = selections[i].from().ch;
					if (p < 16) {
						strings.push(Array(16 - p + 1).join(" "));
					} else if (p < 24) {
						strings.push(Array(24 - p + 1).join(" "));
					} else {
						strings.push(Array(cm.getOption("indentUnit") + 1).join(" "));
					}
				}
				cm.replaceSelections(strings);
			}
		},
		rulers: [
			{ column: 16, color: "#dedede" },
			{ column: 24, color: "#dedede" },
			{ column: 80, color: "#dedede" }
		]
	});
	var $code_mirror = $(code_mirror.getWrapperElement());
	$document.on("fullscreenon", function() {
		$code_mirror.height($(window).height() - $code_mirror.offset().top - 20);
	}).on("fullscreenoff", function() {
		$code_mirror.css("height", "");
	});

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
			code_mirror.setValue(data);
			code_mirror.clearHistory();
		}, "text");
	}
	$load_demo.change(function() {
		var demo = $("option:selected", this).val();
		load_demo(demo)
	});
	load_demo(demos[0]);

	function try_assemble() {
		var t = Date.now();
		function get_ms() {
			return (Date.now() - t);
		}
		try {
			var data = p3js.parser.parseString(code_mirror.getValue());
			var result = p3js.assembler.assembleData(data);
			$output.val("Done (" + get_ms() + " ms).");
			share.buildProgramInfo(result);
			p3sim.loadMemory(result.buffer);
			return result.buffer;
		} catch (e) {
			share.clearProgramInfo();
			$output.val(e);
			console.error(e);
		}
		return null;
	}

	$assemble.click(function() {
		try_assemble();
	});

	$assemble_run.click(function() {
		var buffer = try_assemble();
		if (buffer) {
			p3sim.start();
			window.location.hash = "#simulator";
		}
	});

	$assemble_dl.click(function() {
		var buffer = try_assemble();
		if (buffer) {
			share.downloadBuffer(p3js.writeObjectFormat(buffer), "code.exe");
		}
	});

	$output.val("Initialized.\n");

};
