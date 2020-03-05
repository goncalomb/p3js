import { createDraggableElement } from './utils';

export default function (p3sim, share) {
  let $io_board = $('#io-board');
  let $io_terminal = $('#io-terminal');

  new p3js.dom.IOBoard($io_board, p3sim);
  new p3js.dom.IOTextAreaTerminal($io_terminal, p3sim);

  createDraggableElement($io_board);
  createDraggableElement($io_terminal);
}
