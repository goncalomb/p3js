export default function (p3sim, share) {
  let $body = $(document.body);

  let $sim_start = $('#sim-start');

  new p3js.dom.InfoPanel(p3sim, document.getElementById('sim-status'));
  let debugPanel = new p3js.dom.DebugPanel(p3sim, document.getElementById('sim-debug'));
  let memoryPanel0 = new p3js.dom.MemoryViewPanel(p3sim, document.getElementById('sim-memory0'), 0x8000, 0x80ff);
  let memoryPanel1 = new p3js.dom.MemoryViewPanel(p3sim, document.getElementById('sim-memory1'), 0xfd00, 0xfdff);
  let disassemblePanel = new p3js.dom.MemoryDisassemblePanel(p3sim, document.getElementById('sim-disassemble-container'));

  disassemblePanel.update();

  $('#sim-memory0-edit').click(() => {
    memoryPanel0.promptRange();
  });

  $('#sim-memory1-edit').click(() => {
    memoryPanel1.promptRange();
  });

  $('#sim-disassemble-edit').click(() => {
    disassemblePanel.promptRange();
  });

  $('#sim-speed-factor').on('input', (e) => {
    p3sim.setSpeedFactor(e.currentTarget.value / 1000);
  });

  $sim_start.click(() => {
    if (p3sim.isRunning()) {
      p3sim.stop();
    } else {
      p3sim.start();
    }
  });

  $('#sim-step-i').click(() => {
    p3sim.stepInstruction();
  });

  $('#sim-step-c').click(() => {
    p3sim.stepClock();
    disassemblePanel.update();
  });

  $('#sim-reset').click(() => {
    p3sim.reset();
  });

  $('#sim-show-ctrl').change((e) => {
    debugPanel.showCtrl(e.currentTarget.checked);
    if (e.currentTarget.checked) {
      $('.tab-page-simulator').removeClass('ctrl-hide');
    } else {
      $('.tab-page-simulator').addClass('ctrl-hide');
    }
  });

  $('#sim-show-io').change((e) => {
    $('.tab-page-io .ui-draggable').css({
      top: '0px',
      left: '0px',
    });
    if (e.currentTarget.checked) {
      $body.addClass('sim-io-visible');
    } else {
      $body.removeClass('sim-io-visible');
    }
  });

  $(document).on('p3js-tab-change', (e, tab) => {
    if (tab === 'simulator') {
      setTimeout(() => {
        disassemblePanel.update(false, !p3sim.isRunning());
      });
    }
  });

  p3sim.registerEventHandler('load', () => {
    disassemblePanel.update(true, false);
  });

  p3sim.registerEventHandler('reset', () => {
    disassemblePanel.update(true, false);
  });

  p3sim.registerEventHandler('start', () => {
    $body.addClass('sim-running');
    $sim_start.text('Stop');
    disassemblePanel.update(false, false);
    setTimeout(() => {
      memoryPanel0.scrollToStart();
      memoryPanel1.scrollToEnd();
    }, 10);
  });

  p3sim.registerEventHandler('stop', () => {
    $body.removeClass('sim-running');
    $sim_start.text('Start');
    disassemblePanel.update();
  });
}
