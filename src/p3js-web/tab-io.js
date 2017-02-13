/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

var p3js_web = require(".");

module.exports = function(p3sim) {

	var $io_board = $("#io-board");
	var $io_terminal = $("#io-terminal");

	new p3js.dom.IOBoard($io_board, p3sim);
	new p3js.dom.IOTextAreaTerminal($io_terminal, p3sim);

	p3js_web.createDraggableElement($io_board);
	p3js_web.createDraggableElement($io_terminal);

};
