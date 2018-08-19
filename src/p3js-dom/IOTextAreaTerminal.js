export class IOTextAreaTerminal {
  constructor($container, simulator) {
    $container.addClass('p3js-io-terminal').attr('tabindex', '0');
    let $scroll = $('<div class="p3js-io-terminal-scroll">').appendTo($container);
    let $content = $('<div class="p3js-io-terminal-content">').appendTo($scroll);

    simulator.io.terminal.onClear((buffer, cursorMode) => {
      $content.text('');
    });
    simulator.io.terminal.onTextChange((buffer, cursorMode, x, y, v, c, lf) => {
      $content.text(buffer.join('\n'));
    });

    $container.on('keypress', (e) => {
      e.preventDefault();
      if (simulator.isRunning()) {
        if (e.which === 13) {
          simulator.io.terminal.sendKey(10); // send ENTER as LF insted of CR
        } else {
          simulator.io.terminal.sendKey(e.which);
        }
      }
    });
    $container.on('keydown', (e) => {
      if (e.which === 8 || e.which === 27) { // BS and ESC
        e.preventDefault();
        if (simulator.isRunning()) {
          simulator.io.terminal.sendKey(e.which);
        }
      }
    });
  }
}
