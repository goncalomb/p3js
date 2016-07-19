/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

module.exports = function(share, p3sim) {

	var $rom_a = $("#rom-a");
	var $rom_b = $("#rom-b");
	var $rom_c = $("#rom-c");

	function dump_rom_contents($textarea, data, hex_len) {
		var str = ["INDEX  HEX" + Array(hex_len - 2).join(" ") + "  DEC"];
		var zeros = Array(hex_len + 1).join("0");
		for (var i = 0, l = data.length; i < l; i++) {
			str.push(("     " + i).substr(-5) + "  " + (zeros + data[i].toString(16)).substr(-hex_len) + "  " + data[i]);
		}
		$textarea.val(str.join("\n"));
	}

	// TODO: UI to edit the roms

	function dump_roms() {
		dump_rom_contents($rom_a, p3sim._romA, p3js.constants.ROM_A_WORD_SIZE * 2);
		dump_rom_contents($rom_b, p3sim._romB, p3js.constants.ROM_B_WORD_SIZE * 2);
		dump_rom_contents($rom_c, p3sim._romC, p3js.constants.ROM_C_WORD_SIZE * 2);
	}

	p3sim.registerEventHandler("start", dump_roms);
	dump_roms();

};
