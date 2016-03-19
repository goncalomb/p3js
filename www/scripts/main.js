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

	// program information
	var $prog_mem_info = $("#prog-mem-info");
	var $prog_memory_footprint = $("#prog-memory-footprint");
	var $prog_label_info = $("#prog-label-info");
	var $prog_labels = $("#prog-labels");
	// XXX: refactor canvas code
	var mem_footprint_ctx = $prog_memory_footprint[0].getContext("2d");
	mem_footprint_ctx.textBaseline = "top";
	mem_footprint_ctx.font = "12px monospace";
	var mfl_dx = 5;
	function draw_canvas_label(name, color) {
		mem_footprint_ctx.fillStyle = color;
		mem_footprint_ctx.fillRect(mfl_dx, 256 + 5, 10, 10);
		mem_footprint_ctx.fillStyle = "#222";
		mem_footprint_ctx.fillText(name, mfl_dx + 12, 256 + 4);
		mfl_dx += mem_footprint_ctx.measureText(name).width + 30;
	}
	function clear_program_info() {
		$prog_mem_info.text("");
		$prog_label_info.text("");
		$prog_labels.html("<em>Assemble a program first.</em>\n");
		mem_footprint_ctx.clearRect(0, 0, 1024, 256);
		mem_footprint_ctx.fillText("Assemble a program first.", 5, 5);
	}
	function build_program_info(data) {
		var memory_percent = Math.floor(data.memoryUsage*10000/p3js.constants.MEMORY_SIZE)/100;
		$prog_mem_info.text(data.memoryUsage + "/" + p3js.constants.MEMORY_SIZE + " (" + memory_percent + "%) used");
		$prog_label_info.text(data.labelCount);
		var references = [];
		for (var label in data.labels) {
			var l = label + " ";
			if (l.length < 24) {
				l += Array(24 - l.length + 1).join(" ");
			}
			var v = data.labels[label].toString(16);
			if (v.length < 4) {
				v = Array(4 - v.length + 1).join("0") + v;
			}
			references.push(l + v + "\n");
		}
		$prog_labels.text(references.join(""));
		data.usedAddresses.forEach(function(value, i) {
			var x = (i%512);
			var y = Math.floor(i/512);
			if (value == 1) {
				mem_footprint_ctx.fillStyle = "#222";
			} else if (value == 2) {
				mem_footprint_ctx.fillStyle = "#12d";
			} else if (value == 3) {
				mem_footprint_ctx.fillStyle = "#2d1";
			} else if (value == 4) {
				mem_footprint_ctx.fillStyle = "#d21";
			} else if (i%2 == y%2) {
				mem_footprint_ctx.fillStyle = "#ddd";
			} else {
				mem_footprint_ctx.fillStyle = "#eee";
			}
			mem_footprint_ctx.fillRect(x*2, y*2, 2, 2);
		});
	}
	clear_program_info();
	draw_canvas_label("Empty", "#d7d7d7");
	draw_canvas_label("WORD", "#12d");
	draw_canvas_label("STR", "#2d1");
	draw_canvas_label("TAB", "#d21");
	draw_canvas_label("Instructions", "#222");

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
		var t = Date.now();
		function get_ms() {
			return (Date.now() - t);
		}
		try {
			var data = p3js.parser.parseString(code_mirror.getValue());
			var result = p3js.assembler.assembleData(data);
			$output.val("Done (" + get_ms() + " ms).");
			build_program_info(result);
			p3sim.loadMemory(result.buffer);
			return result.buffer;
		} catch (e) {
			clear_program_info();
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
		var obj_buffer = p3js.writeObjectFormat(buffer);
		if (buffer) {
			download_buffer(obj_buffer, "code.exe");
		}
	});

	$output.val("Initialized.\n");

	// simulator
	var p3sim = window.p3sim = new p3js.Simulator();
	var $sim_registers = $("#sim-registers");
	var $sim_memory = $("#sim-memory");
	var $sim_status = $("#sim-status");
	var $sim_start = $("#sim-start");
	var $sim_step_i = $("#sim-step-i");
	var $sim_step_c = $("#sim-step-c");
	var $sim_reset = $("#sim-reset");
	var $sim_show_ctrl = $("#sim-show-ctrl");

	var show_ctrl = false;

	function sim_update_registers() {
		function hex(n) {
			return ("000" + (n & 0xffff).toString(16)).substr(-4);
		}
		var text = [];
		for (var i = 0; i < 7; i++) {
			text.push("R" + i + ":  " + hex(p3sim._registers[i]));
		}
		text.push("", "SP:  " + hex(p3sim._registers[14]));
		text.push("PC:  " + hex(p3sim._registers[15]));
		text.push("", "E Z C N O");
		text.push(("000000" + (p3sim._re & 0x1f).toString(2)).substr(-5).split("").join(" "));
		if (show_ctrl) {
			text.push("");
			for (var i = 7; i < 16; i++) {
				text.push("R" + i + ": " + (i < 10 ? " " : "" ) + hex(p3sim._registers[i]));
			}
			text.push("", "CAR: " + hex(p3sim._car));
			text.push("SBR: " + hex(p3sim._sbr));
			text.push("RI:  " + hex(p3sim._ri));
			text.push("", "INT: " + p3sim._int);
			text.push("z: " + (p3sim._re >> 6 & 0x1) + " c: " + (p3sim._re >> 5 & 0x1));
		}
		$sim_registers.val(text.join("\n"));
	}

	function sim_update_status(c, i, s) {
		var s_str;
		if (s >= 1000000) {
			s_str = Math.round(s/100000)/10 + " MHz";
		} else if (s >= 1000) {
			s_str = Math.round(s/100)/10 + " kHz";
		} else {
			s_str = Math.round(s*10)/10 + " Hz";
		}
		$sim_status.html(
			"Speed: " + s_str + "\n" +
			"Clock: " + c.toLocaleString() + "\n" +
			"Instructions: " + i.toLocaleString() + "\n"
		);
	}

	$sim_start.click(function() {
		if (p3sim.isRunning()) {
			p3sim.stop();
		} else {
			p3sim.start();
		}
	});

	$sim_step_i.click(function() {
		p3sim.stepInstruction();
	});

	$sim_step_c.click(function() {
		p3sim.stepClock();
	});

	$sim_reset.click(function() {
		p3sim.reset();
	});

	$sim_show_ctrl.change(function() {
		show_ctrl = this.checked;
		if (show_ctrl) {
			$sim_step_i.text("Step (Instruction)");
			$sim_step_c.removeClass("hidden");
		} else {
			$sim_step_i.text("Step");
			$sim_step_c.addClass("hidden");
		}
		sim_update_registers();
	});

	p3sim.registerEventHandler("start", function() {
		$body.addClass("sim-running");
		$sim_start.text("Stop");
	});
	p3sim.registerEventHandler("stop", function(c, i, s) {
		sim_update_status(c, i, s);
		$body.removeClass("sim-running");
		$sim_start.text("Start");
	});
	p3sim.registerEventHandler("clock", function(c, i, s) {
		sim_update_registers();
		sim_update_status(c, i, s);
	});
	p3sim.registerEventHandler("reset", function() {
		sim_update_status(0, 0, 0);
	});

	sim_update_registers();
	sim_update_status(0, 0, 0);

});
