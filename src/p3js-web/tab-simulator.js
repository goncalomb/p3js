export default function(p3sim) {
  let $body = $(document.body);

  let $sim_memory0 = $("#sim-memory0");
  let $sim_memory1 = $("#sim-memory1");
  let $sim_start = $("#sim-start");

  new p3js.dom.InfoPanel(p3sim, $("#sim-status"));
  let debugPanel = new p3js.dom.DebugPanel(p3sim, $("#sim-debug-main"), $("#sim-debug-control"));

  let memoryPanel0 = new p3js.dom.MemoryViewPanel(p3sim, $sim_memory0, 32768, 32768 + 256);
  let memoryPanel1 = new p3js.dom.MemoryViewPanel(p3sim, $sim_memory1, 64768, 64768 + 256);

  $("#sim-memory0-edit").click(() => {
    memoryPanel0.promptRange();
  });

  $("#sim-memory1-edit").click(() => {
    memoryPanel1.promptRange();
  });

  $sim_start.click(() => {
    if (p3sim.isRunning()) {
      p3sim.stop();
    } else {
      p3sim.start();
    }
  });

  $("#sim-step-i").click(() => {
    p3sim.stepInstruction();
  });

  $("#sim-step-c").click(() => {
    p3sim.stepClock();
  });

  $("#sim-reset").click(() => {
    p3sim.reset();
  });

  $("#sim-show-ctrl").change(() => {
    debugPanel.showCtrl(this.checked);
    if (this.checked) {
      $(".tab-page-simulator").removeClass("ctrl-hide");
    } else {
      $(".tab-page-simulator").addClass("ctrl-hide");
    }
  });

  $("#sim-show-io").change(() => {
    $(".tab-page-io .ui-draggable").css({
      top: "0px",
      left: "0px",
    });
    if (this.checked) {
      $body.addClass("sim-io-visible");
    } else {
      $body.removeClass("sim-io-visible");
    }
  });

  p3sim.registerEventHandler("start", () => {
    $body.addClass("sim-running");
    $sim_start.text("Stop");
    setTimeout(() => {
      $sim_memory1[0].scrollTop = $sim_memory1[0].scrollHeight;
    }, 10);
  });
  p3sim.registerEventHandler("stop", () => {
    $body.removeClass("sim-running");
    $sim_start.text("Start");
  });
}
