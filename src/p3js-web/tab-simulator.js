export default function(p3sim) {
  var $body = $(document.body);

  var $sim_memory0 = $("#sim-memory0");
  var $sim_memory1 = $("#sim-memory1");
  var $sim_start = $("#sim-start");

  var info_panel = new p3js.dom.InfoPanel(p3sim, $("#sim-status"));
  var debug_panel = new p3js.dom.DebugPanel(p3sim, $("#sim-debug-main"), $("#sim-debug-control"));

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

  $("#sim-step-i").click(function() {
    p3sim.stepInstruction();
  });

  $("#sim-step-c").click(function() {
    p3sim.stepClock();
  });

  $("#sim-reset").click(function() {
    p3sim.reset();
  });

  $("#sim-show-ctrl").change(function() {
    debug_panel.showCtrl(this.checked);
    if (this.checked) {
      $(".tab-page-simulator").removeClass("ctrl-hide");
    } else {
      $(".tab-page-simulator").addClass("ctrl-hide");
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
    }, 10);
  });
  p3sim.registerEventHandler("stop", function() {
    $body.removeClass("sim-running");
    $sim_start.text("Start");
  });
};
