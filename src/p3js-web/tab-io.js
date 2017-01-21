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

	p3sim.setIOHandlers({
		// IO read addresses
		0xfffd: function() { return terminal.state(); }, // terminal state
		0xffff: function() { return terminal.read(); } // terminal read
	}, {
		// IO write addresses
		0xfffc: function(v) { terminal.control(v); }, // terminal control
		0xfffe: function(v) { terminal.write(v); } // terminal write
	});

};
