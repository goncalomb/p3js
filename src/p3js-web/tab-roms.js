/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

module.exports = function(share, p3sim) {

	var dump_funcs = [];

	function dump_rom_contents($textarea, data, pad_value) {
		var pad_key = Math.ceil(Math.log2(data.length)/4);
		var str = [];
		var zeros = Array(11).join("0");
		for (var i = 0, l = data.length; i < l; i++) {
			str.push((zeros + i.toString(16)).substr(-pad_key) + " " + (zeros + data[i].toString(16)).substr(-pad_value));
		}
		$textarea.val(str.join("\n"));
	}

	function dump_roms() {
		dump_funcs.forEach(function(fn) { fn(); });
	}

	function parse_rom_values(text, k_limit, v_limit) {
		var values = [];
		var regex = /^0*([0-9a-f]{1,16})\s+0*([0-9a-f]{1,16})(?:\s*#|$)/i;
		var lines = text.split("\n");
		for (var i = 0, l = lines.length; i < l; i++) {
			var line = lines[i].trim();
			if (line.length == 0 || line[0] == "#") continue;
			var matches = line.match(regex);
			if (matches) {
				var k = parseInt(matches[1], 16);
				if (k < 0 || k > k_limit) {
					throw "Invalid index " + matches[1] + " expecting 0 to " + k_limit.toString(16) + " (hex), on line " + (i + 1);
				}
				if (values[k] !== undefined) {
					throw "Duplicate index " + matches[1] + ", on line " + (i + 1);
				}
				var v = parseInt(matches[2], 16);
				if (v < 0 || v > v_limit) {
					throw "Invalid value " + matches[2] + " expecting 0 to " + v_limit.toString(16) + " (hex), on line " + (i + 1);
				}
				values[k] = v;
			} else {
				throw "Syntax error, on line " + (i + 1);
			}
		}
		return values;
	}

	['a', 'b', 'c'].forEach(function(key, value) {
		var upper = key.toUpperCase();
		var rom_size = p3js.devices.CPU["ROM_" + upper + "_SIZE"];
		var rom_word_length = p3js.devices.CPU["ROM_" + upper + "_WORD_LENGTH"];

		var $wrapper = $("#rom-" + key + "-wrapper");
		$wrapper.append($("<h3>").text("ROM " + upper));
		var $btn_apply = $("<button class=\"btn btn-link btn-xs pull-right\">").text("Apply to ROM " + upper);
		$wrapper.append($("<h4>").text("Changes ").append($btn_apply));
		var $changes = $("<textarea>").attr({
			"rows": 10,
			"placeholder" : "Put changes to ROM " + upper + " here!\n<index hex> <value hex>\n..."
		}).appendTo($wrapper);
		$wrapper.append($("<h4>").text("Contents "));
		var $contents = $("<textarea readonly>").attr("rows", (rom_size > 32 ? 32 : rom_size)).appendTo($wrapper);

		var dump_func = function() {
			dump_rom_contents($contents, p3sim._cpu["_rom" + upper], Math.ceil(rom_word_length/4));
		}
		dump_funcs.push(dump_func);

		$btn_apply.click(function() {
			p3sim.stop();
			p3sim._cpu["resetRom" + upper]();
			try {
				var new_values = parse_rom_values($changes.val(), rom_size, Math.pow(2, rom_word_length) - 1);
				for (k in new_values) {
					p3sim._cpu["_rom" + upper][k] = new_values[k];
				}
			} catch (e) {
				if (typeof e == "string") {
					alert("Error: " + e);
					return;
				} else {
					throw e;
				}
			}
			dump_func();
			alert("Done.");
		});
	});

	p3sim.registerEventHandler("start", dump_roms);
	dump_roms();

};
