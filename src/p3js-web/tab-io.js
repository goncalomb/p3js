/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

module.exports = function(share, p3sim) {

	var IOBoard = require("./IOBoard.js");
	var IOTerminal = require("./IOTerminal.js");

	var board = new IOBoard(p3sim);
	var terminal = new IOTerminal(p3sim);

	share.createDraggableElement($("#io-board"));
	share.createDraggableElement($("#io-terminal-wrapper"));

	p3sim.registerEventHandler("reset", function() {
		board.reset();
		terminal.reset();
	});

};
