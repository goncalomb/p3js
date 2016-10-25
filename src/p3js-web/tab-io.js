/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

module.exports = function(share, p3sim) {

	var IOBoard = require("./IOBoard.js");
	var IOTerminal = require("./IOTerminal.js");
	var IOTimer = require("./IOTimer.js");

	var board = new IOBoard(p3sim);
	var terminal = new IOTerminal(p3sim);
	var timer = new IOTimer(p3sim);

	share.createDraggableElement($("#io-board"));
	share.createDraggableElement($("#io-terminal-wrapper"));

	p3sim.registerEventHandler("reset", function() {
		board.reset();
		terminal.reset();
		timer.reset();
	});

	p3sim.setIOHandlers({
		// IO read addresses
		0xfff6: function() { return timer.getValue(); }, // timer value
		0xfff7: function() { return timer.state(); }, // timer control
		0xfff9: function() { return board.switches(); }, // switches
		0xfffd: function() { return terminal.state(); }, // terminal state
		0xffff: function() { return terminal.read(); } // terminal read
	}, {
		// IO write addresses
		0xfff0: function(v) { board.set7Segment(v & 0xf, 0xfff0); }, // 7 segment write 0
		0xfff1: function(v) { board.set7Segment((v & 0xf) << 4, 0xff0f); }, // 7 segment write 1
		0xfff2: function(v) { board.set7Segment((v & 0xf) << 8, 0xf0ff); }, // 7 segment write 2
		0xfff3: function(v) { board.set7Segment((v & 0xf) << 12, 0x0fff); }, // 7 segment write 3
		0xfff4: function(v) { board.lcdControl(v); }, // lcd control
		0xfff5: function(v) { board.lcdWrite(v); }, // lcd write
		0xfff6: function(v) { timer.setValue(v); }, // timer value
		0xfff7: function(v) { timer.control(v); }, // timer control
		0xfff8: function(v) { board.leds(v); }, // leds
		0xfffc: function(v) { terminal.control(v); }, // terminal control
		0xfffe: function(v) { terminal.write(v); } // terminal write
	});

};
