$(window).ready(function() {

	var $document = $(document);
	var $body = $(document.body);

	var $load_demo = $("#load-demo")
	var $output = $("#output");
	var $assemble = $("#assemble");
	var $assemble_run = $("#assemble-run");
	var $assemble_dl = $("#assemble-dl");

	// fullscreen
	function request_fullscreen(elem) {
		var fn = (
			elem.requestFullscreen || elem.msRequestFullscreen ||
			elem.mozRequestFullScreen || elem.webkitRequestFullscreen
		);
		if (fn) fn.apply(elem);
	}
	function exit_fullscreen() {
		var fn = (
			document.exitFullscreen || document.msExitFullscreen ||
			document.mozCancelFullScreen || document.webkitExitFullscreen
		);
		if (fn) fn.apply(document);
	}
	$("#fullscr").click(function() {
		if ($body.hasClass("fullscreen")) {
			exit_fullscreen();
		} else {
			request_fullscreen(document.documentElement);
		}
		return false;
	});
	$(document).on("webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange", function() {
		if ($body.hasClass("fullscreen")) {
			$body.removeClass("fullscreen");
			$document.trigger("fullscreenoff");
		} else {
			$body.addClass("fullscreen");
			$document.trigger("fullscreenon");
		}
	});

	// tabs
	var $all_tab_lis = $(".nav-tabs li");
	var $all_tabs = $(".tab-page");
	$(window).on("load hashchange", function() {
		var hash = window.location.hash.substr(1);
		if (hash == "assembler") {
			if (history.replaceState !== undefined) {
				history.replaceState({ }, document.title, window.location.pathname);
			} else {
				window.location.hash = "";
				return;
			}
		} else if (hash == "") {
			hash = "assembler";
		}
		var $tab = $(".tab-page-" + hash);
		if ($tab.length > 0) {
			$all_tabs.addClass("hidden");
			$tab.removeClass("hidden");
			$all_tab_lis.removeClass("active");
			$("a[href=\"#" + hash + "\"]", $all_tab_lis).parent().addClass("active");
		}
	});

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

	function download_buffer(buffer, name) {
		var blob = new Blob([buffer], { type: "application/octet-stream" });
		var url = URL.createObjectURL(blob);
		var a = document.createElement("a");
		if ("download" in a) {
			a.href = url;
			a.download = (name ? name : "file");
			a.dispatchEvent(new MouseEvent("click"));
		} else {
			window.location = url;
		}
		setTimeout(function() {
			URL.revokeObjectURL(url);
		});
	}

	function try_assemble() {
		try {
			var data = p3js.parser.parseString(code_mirror.getValue());
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
		var buffer = try_assemble();
		var obj_buffer = p3js.writeObjectFormat(buffer);
		if (buffer) {
			download_buffer(obj_buffer, "code.exe");
		}
	});

	$output.val("Initialized.\n");

});
