/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

module.exports = function(share, p3sim) {

	var $io_terminal = $("#io-terminal");
	var $io_terminal_wrapper = $("#io-terminal-wrapper");
	var $io_board = $("#io-board");
	var $io_board_lcd = $("#io-board-lcd");
	var $io_board_leds = $("#io-board-leds");
	var $io_board_7seg = $("#io-board-7seg");
	var $io_board_buttons = $("#io-board-buttons");
	var $io_board_switches = $("#io-board-switches");
	var $leds = [];

	var lcd_active = true;
	var lcd_x = 0;
	var lcd_y = 0;
	var lcd_text = null;
	var seg7_value = 0;
	var timer_value = 0;
	var timer_state = 0;
	var timer_interval = 0;
	var switches_value = 0;
	var terminal_x = -1;
	var terminal_y = -1;
	var terminal_last_key = 0;

	function reset_lcd() {
		lcd_active = true;
		lcd_x = 0;
		lcd_y = 0;
		lcd_text = null;
		$io_board_lcd.val("");
	}

	function update_7seg(value) {
		seg7_value = value;
		$io_board_7seg.text(("0000" + seg7_value.toString(16)).substr(-4));
	}

	function reset_switches() {
		switches_value = 0;
		$io_board_switches.children().removeClass("on");
	}

	function control_timer(state) {
		if (state == 0) {
			clearInterval(timer_interval);
			timer_state = 0;
			timer_interval = 0;
		} else if (timer_state == 0) {
			timer_state = 1;
			timer_interval = setInterval(function() {
				if (timer_value <= 0) {
					control_timer(0);
					p3sim.interrupt(15);
				} else {
					timer_value--;
				}
			}, 100);
		}
	}

	function reset_terminal() {
		terminal_x = terminal_y = -1;
		terminal_last_key = 0;
		$io_terminal.val("");
	}

	$io_terminal.on("keypress", function(e) {
		if (p3sim.isRunning()) {
			terminal_last_key = e.which;
		}
	});

	// populate board elements

	for (var i = 0; i < 16; i++) {
		$leds.push($("<span>").appendTo($io_board_leds));
	}

	$io_board_7seg.text("0000");

	function create_button_row(arr) {
		var $div = $("<div>");
		arr.forEach(function(i) {
			$("<button>").addClass("btn btn-xs").text("I" + i.toString(16).toUpperCase()).click(function() {
				p3sim.interrupt(i);
			}).appendTo($div);
		});
		$div.appendTo($io_board_buttons);
	}
	create_button_row([7,  8,  9, 12]);
	create_button_row([4,  5,  6, 13]);
	create_button_row([1,  2,  3, 14]);
	create_button_row([0, 10, 11]);

	function create_switch(i) {
		$("<button>").addClass("btn").click(function() {
			var $this = $(this);
			if ($this.hasClass("on")) {
				$this.removeClass("on");
				switches_value &= ~(1 << (7 - i));
			} else {
				$this.addClass("on");
				switches_value |= 1 << (7 - i);
			}
		}).appendTo($io_board_switches);
	}
	for (var i = 0; i < 8; i++) {
		create_switch(i);
	}

	share.createDraggableElement($io_board);
	share.createDraggableElement($io_terminal_wrapper);

	// register p3 simulator handlers

	p3sim.registerEventHandler("reset", function() {
		reset_lcd();
		$io_board_leds.find(".on").removeClass("on");
		update_7seg(0);
		timer_value = 0;
		control_timer(0);
		reset_switches();
		reset_terminal();
	});

	p3sim.setIOHandlers({
		// IO read addresses
		0xfff6: function() { // timer value
			return timer_value;
		},
		0xfff7: function() { // timer state
			return timer_state;
		},
		0xfff9: function() { // switches
			return switches_value;
		},
		0xfffd: function() { // terminal state
			return (terminal_last_key ? 1 : 0);
		},
		0xffff: function() { // terminal read
			var k = terminal_last_key;
			terminal_last_key = 0;
			return k;
		}
	}, {
		// IO write addresses
		0xfff0: function(v) { // 7 segment write 0
			update_7seg((seg7_value & 0xfff0) | (v & 0xf));
		},
		0xfff1: function(v) { // 7 segment write 1
			update_7seg((seg7_value & 0xff0f) | ((v & 0xf) << 4));
		},
		0xfff2: function(v) { // 7 segment write 2
			update_7seg((seg7_value & 0xf0ff) | ((v & 0xf) << 8));
		},
		0xfff3: function(v) { // 7 segment write 3
			update_7seg((seg7_value & 0x0fff) | ((v & 0xf) << 12));
		},
		0xfff4: function(v) { // lcd control
			if ((v & 0x20) != 0) {
				$io_board_lcd.val("");
				lcd_text = null;
			}
			if ((v & 0x8000) == 0) {
				$io_board_lcd.val("");
				lcd_active = false;
			} else {
				if (!lcd_active && lcd_text) {
					$io_board_lcd.val(lcd_text.join("\n"));
				}
				lcd_active = true;
			}
			lcd_x = v & 0xf;
			lcd_y = v >> 4 & 0x1;
		},
		0xfff5: function(v) { // lcd write
			if (!lcd_text) {
				lcd_text = [
					Array(16 + 1).join(" "),
					Array(16 + 1).join(" ")
				];
			}
			var str = lcd_text[lcd_y];
			str = str.substr(0, lcd_x) + String.fromCharCode(v) + str.substr(lcd_x + 1, str.length);
			lcd_text[lcd_y] = str;
			if (lcd_active) {
				$io_board_lcd.val(lcd_text.join("\n"));
			}
		},
		0xfff6: function(v) { // timer value
			timer_value = v;
		},
		0xfff7: function(v) { // timer state
			control_timer(v & 0x1);
		},
		0xfff8: function(v) { // leds
			for (var i = 0; i < 16; i++) {
				if (((v << i) & 0x8000) == 0) {
					$leds[i].removeClass("on");
				} else {
					$leds[i].addClass("on");
				}
			}
		},
		0xfffc: function(v) { // terminal control
			if (v == 0xffff) {
				terminal_x = terminal_y = 0;
				$io_terminal.val(Array(80*24 + 1).join(" "));
			} else {
				terminal_x = v & 0xff;
				terminal_y = v >> 8 & 0xff;
			}
		},
		0xfffe: function(v) { // terminal write
			if (terminal_x == -1) {
				var val = $io_terminal.val();
				val += String.fromCharCode(v);
				if ((val.length + 1)%81 == 0) {
					val += "\n";
				}
				$io_terminal.val(val);
				// XXX: causes to many browser redraws
				// $io_terminal[0].scrollTop = $io_terminal[0].scrollHeight;
			} else if (terminal_x < 80 && terminal_y < 24) {
				var str = $io_terminal.val();
				var i = terminal_x + terminal_y*80;
				str = str.substr(0, i) + String.fromCharCode(v) + str.substr(i + 1, str.length);
				$io_terminal.val(str);
			}
		}
	});

};
