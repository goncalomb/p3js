module.exports = function(share, p3sim) {

	var $io_terminal = $("#io-terminal");
	var $io_board_lcd = $("#io-board-lcd");
	var $io_board_leds = $("#io-board-leds");
	var $io_board_7seg = $("#io-board-7seg");
	var $io_board_buttons = $("#io-board-buttons");
	var $io_board_switches = $("#io-board-switches");
	var $leds = [];

	var seg7_value = 0;
	var terminal_x = -1;
	var terminal_y = -1;
	var terminal_last_key = 0;

	function update_7seg(value) {
		seg7_value = value;
		$io_board_7seg.text(("0000" + seg7_value.toString(16)).substr(-4));
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
			$("<button>").addClass("btn btn-xs").text("I" + i.toString(16).toUpperCase()).appendTo($div);
		});
		$div.appendTo($io_board_buttons);
	}
	create_button_row([7,  8,  9, 12]);
	create_button_row([4,  5,  6, 13]);
	create_button_row([1,  2,  3, 14]);
	create_button_row([0, 10, 11]);

	for (var i = 0; i < 8; i++) {
		$("<button>").addClass("btn").click(function() {
			var $this = $(this);
			if ($this.hasClass("on")) {
				$this.removeClass("on");
			} else {
				$this.addClass("on");
			}
		}).appendTo($io_board_switches);
	}

	// register p3 simulator handlers

	p3sim.registerEventHandler("reset", function() {
		update_7seg(0);
		reset_terminal();
	});

	p3sim.setIOHandlers({
		// IO read addresses
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
				$io_terminal.val($io_terminal.val() + String.fromCharCode(v));
			} else if (terminal_x < 80 && terminal_y < 24) {
				var str = $io_terminal.val();
				var i = terminal_x + terminal_y*80;
				str = str.substr(0, i) + String.fromCharCode(v) + str.substr(i + 1, str.length);
				$io_terminal.val(str);
			}
		}
	});

};
