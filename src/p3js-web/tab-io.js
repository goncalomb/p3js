import * as p3js_web from './';

export default function(p3sim) {
  var $io_board = $("#io-board");
  var $io_terminal = $("#io-terminal");

  new p3js.dom.IOBoard($io_board, p3sim);
  new p3js.dom.IOTextAreaTerminal($io_terminal, p3sim);

  p3js_web.createDraggableElement($io_board);
  p3js_web.createDraggableElement($io_terminal);
};
