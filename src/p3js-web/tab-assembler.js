module.exports = function(share, p3sim) {

	var $document = $(document);

	var $load_demo = $("#load-demo")
	var $assemble = $("#assemble");
	var $assemble_run = $("#assemble-run");
	var $assemble_dl = $("#assemble-dl");
	var $asm_use_linter = $("#asm-use-linter");
	var $asm_info = $("#asm-info");

	function asm_info_add(message, cssClass) {
		if (message) {
			var $li = $("<li>").text(message).appendTo($asm_info);
			if (cssClass) {
				$li.attr("class", cssClass);
			}
		} else {
			$asm_info.html("");
		}
	}

	// linter
	var use_linter = true;
	CodeMirror.registerHelper("lint", null, function(text) {
		if (use_linter) {
			try {
				p3js.assembler.assembleData(p3js.parser.parseString(text));
			} catch (e) {
				var matches = e.toString().match(/^(.*), on line (\d+)$/);
				if (matches) {
					return [{
						from: CodeMirror.Pos(matches[2] - 1, 0),
						to: CodeMirror.Pos(matches[2] - 1, 80),
						message: matches[1]
					}];
				}
			}
		}
		return [];
	});

	// editor
	var $code = $("#code");
	var code_mirror = CodeMirror.fromTextArea($code[0], {
		lineNumbers: true,
		indentUnit: 4,
		gutters: ["CodeMirror-lint-markers"],
		lint: true,
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

	var is_assembling = false;

	function assemble_program(callback) {
		if (!is_assembling) {
			is_assembling = true;
			asm_info_add(null)
			asm_info_add("Assembling...");
			setTimeout(function() {
				var t = Date.now();
				try {
					var data = p3js.parser.parseString(code_mirror.getValue());
					var result = p3js.assembler.assembleData(data);
					asm_info_add(null)
					asm_info_add("Assembling finished (" + (Date.now() - t) + " ms).", "text-success");
					asm_info_add("Program loaded on simulator.", "text-info small");
					share.buildProgramInfo(result);
					p3sim.loadMemory(result.buffer);
					if (callback) {
						callback(result);
					}
				} catch (e) {
					share.clearProgramInfo();
					asm_info_add(null)
					if (e.substr(0, 15) == "Internal Error:") {
						asm_info_add("Something is not right with the assembler (" + e.substr(16) + ").", "text-danger");
						asm_info_add("Please contact me so I can look into it. Thanks.", "text-info small");
					} else {
						asm_info_add(e, "text-danger");
					}
				}
				is_assembling = false;
			});
		}
	}

	$assemble.click(function() {
		assemble_program();
	});

	$assemble_run.click(function() {
		assemble_program(function(result) {
			p3sim.start();
			window.location.hash = "#simulator";
		});
	});

	$assemble_dl.click(function() {
		assemble_program(function(result) {
			share.downloadBuffer(p3js.writeObjectFormat(result.buffer), "code.exe");
			asm_info_add("Download requested (p3as format).", "text-info small");
		});
	});

	$asm_use_linter.change(function() {
		use_linter = this.checked;
	});

	asm_info_add("Initialized.");

};
