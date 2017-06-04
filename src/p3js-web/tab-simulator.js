module.exports = function(p3sim) {

	var $body = $(document.body);

	var $sim_debug_main = $("#sim-debug-main");
	var $sim_debug_control = $("#sim-debug-control");
	var $sim_memory0 = $("#sim-memory0");
	var $sim_memory1 = $("#sim-memory1");
	var $sim_start = $("#sim-start");
	var $sim_step_i = $("#sim-step-i");
	var $sim_step_c = $("#sim-step-c");
	var $sim_reset = $("#sim-reset");

	var info_panel = new p3js.dom.InfoPanel(p3sim, $("#sim-status"));
	var debug_panel = new p3js.dom.DebugPanel(p3sim, $sim_debug_main, $sim_debug_control);

	var memory_panel0 = new p3js.dom.MemoryViewPanel(p3sim, $sim_memory0, 32768, 32768 + 256);
	var memory_panel1 = new p3js.dom.MemoryViewPanel(p3sim, $sim_memory1, 64768, 64768 + 256);

	$("#sim-memory0-edit").click(function() {
		memory_panel0.promptRange();
	});

	$("#sim-memory1-edit").click(function() {
		memory_panel1.promptRange();
	});

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

	$("#sim-show-ctrl").change(function() {
		debug_panel.showCtrl(this.checked);
		if (this.checked) {
			$sim_step_i.text("Step (Instruction)");
			$sim_step_c.removeClass("hidden");
			$sim_debug_control.parent().removeClass("hidden");
		} else {
			$sim_step_i.text("Step");
			$sim_step_c.addClass("hidden");
			$sim_debug_control.val("");
			$sim_debug_control.parent().addClass("hidden");
		}
	});

	$("#sim-show-io").change(function() {
		$(".tab-page-io .ui-draggable").css({
			top: "0px",
			left: "0px"
		});
		if (this.checked) {
			$body.addClass("sim-io-visible");
		} else {
			$body.removeClass("sim-io-visible");
		}
	});

	p3sim.registerEventHandler("start", function() {
		$body.addClass("sim-running");
		$sim_start.text("Stop");
		setTimeout(function() {
			$sim_memory1[0].scrollTop = $sim_memory1[0].scrollHeight;
		});
	});
	p3sim.registerEventHandler("stop", function() {
		$body.removeClass("sim-running");
		$sim_start.text("Start");
	});

};
