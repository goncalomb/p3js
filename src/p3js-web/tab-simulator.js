module.exports = function(share, p3sim) {

	var $body = $(document.body);

	var $sim_debug_main = $("#sim-debug-main");
	var $sim_debug_control = $("#sim-debug-control");
	var $sim_memory = $("#sim-memory");
	var $sim_status = $("#sim-status");
	var $sim_start = $("#sim-start");
	var $sim_step_i = $("#sim-step-i");
	var $sim_step_c = $("#sim-step-c");
	var $sim_reset = $("#sim-reset");
	var $sim_show_ctrl = $("#sim-show-ctrl");
	var $sim_show_io = $("#sim-show-io");

	var show_ctrl = false;
	var show_io = false;

	function sim_update_debug_panel() {
		function hex(n) {
			return ("000" + (n & 0xffff).toString(16)).substr(-4);
		}
		// XXX: the debug panel should not be using "private" p3sim variables
		var text = [];
		for (var i = 0; i < 8; i++) {
			text.push("R" + i + ":  " + hex(p3sim._registers[i]));
		}
		text.push("", "SP:  " + hex(p3sim._registers[14]));
		text.push("PC:  " + hex(p3sim._registers[15]));
		text.push("", "Flags:", "E Z C N O");
		text.push(("000000" + (p3sim._re & 0x1f).toString(2)).substr(-5).split("").join(" "));
		$sim_debug_main.val(text.join("\n"));
		if (show_ctrl) {
			var text = [];
			for (var i = 8; i < 16; i++) {
				text.push("R" + i + ": " + (i < 10 ? " " : "" ) + hex(p3sim._registers[i]));
			}
			text.push("", "CAR: " + hex(p3sim._car));
			text.push("SBR: " + hex(p3sim._sbr));
			text.push("RI:  " + hex(p3sim._ri));
			text.push("", "INT: " + p3sim._int);
			text.push("z: " + (p3sim._re >> 6 & 0x1) + " c: " + (p3sim._re >> 5 & 0x1));
			$sim_debug_control.val(text.join("\n"));
		}
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
			$sim_debug_control.parent().removeClass("hidden");
		} else {
			$sim_step_i.text("Step");
			$sim_step_c.addClass("hidden");
			$sim_debug_control.val("");
			$sim_debug_control.parent().addClass("hidden");
		}
		sim_update_debug_panel();
	});

	$sim_show_io.change(function() {
		show_io = this.checked;
		$(".tab-page-io .ui-draggable").css({
			top: "0px",
			left: "0px"
		});
		if (show_io) {
			$body.addClass("sim-io-visible");
		} else {
			$body.removeClass("sim-io-visible");
		}
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
		sim_update_debug_panel();
		sim_update_status(c, i, s);
	});
	p3sim.registerEventHandler("reset", function() {
		sim_update_debug_panel();
		sim_update_status(0, 0, 0);
	});

	sim_update_debug_panel();
	sim_update_status(0, 0, 0);

};
