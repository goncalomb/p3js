module.exports = function(p3sim) {

	var $io_terminal = $("#io-terminal");
	var $io_board_lcd = $("#io-board-lcd");
	var $io_board_leds = $("#io-board-leds");
	var $io_board_7seg = $("#io-board-7seg");
	var $io_board_buttons = $("#io-board-buttons");
	var $io_board_switches = $("#io-board-switches");
	var $leds = [];

	var seg7_value = 0;

	function update_7seg(value) {
		seg7_value = value;
		$io_board_7seg.text(("0000" + seg7_value.toString(16)).substr(-4));
	}

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
	});

	p3sim.setIOHandler({
		set7Seg0: function(v) {
			update_7seg((seg7_value & 0xfff0) | (v & 0xf));
		},
		set7Seg1: function(v) {
			update_7seg((seg7_value & 0xff0f) | ((v & 0xf) << 4));
		},
		set7Seg2: function(v) {
			update_7seg((seg7_value & 0xf0ff) | ((v & 0xf) << 8));
		},
		set7Seg3: function(v) {
			update_7seg((seg7_value & 0x0fff) | ((v & 0xf) << 12));
		}
	});

};
