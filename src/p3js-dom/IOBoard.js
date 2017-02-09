var Board = module.exports = function($container, p3sim) {
	$container.addClass("p3js-io-board");
	var $board_lcd = $("<textarea class=\"p3js-io-board-lcd\" cols=\"12\" rows=\"2\" readonly>").appendTo($container);
	var $board_leds = $("<div class=\"p3js-io-board-leds\">").appendTo($container);
	var $board_7seg = $("<div class=\"p3js-io-board-7seg\">").text("0000").appendTo($container);
	var $board_buttons = $("<div class=\"p3js-io-board-buttons\">").appendTo($container);
	var $board_switches = $("<div class=\"p3js-io-board-switches\">").appendTo($container);

	var leds$array = [ ];
	for (var i = 0; i < 16; i++) {
		leds$array.push($("<span>").appendTo($board_leds));
	}

	// TODO: remove bootstrap classes from buttons.. maybe..

	function create_button_row(arr) {
		var $div = $("<div>");
		arr.forEach(function(i) {
			$("<button>").addClass("btn btn-xs").text("I" + i.toString(16).toUpperCase()).click(function() {
				p3sim.interrupt(i);
			}).appendTo($div);
		});
		$div.appendTo($board_buttons);
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
				p3sim.io.switches.unset(7 - i);
			} else {
				$this.addClass("on");
				p3sim.io.switches.set(7 - i);
			}
		}).appendTo($board_switches);
	}
	for (var i = 0; i < 8; i++) {
		create_switch(i);
	}

	p3sim.io.seg7.onStateChange(function(value) {
		$board_7seg.text(("0000" + value.toString(16)).substr(-4));
	});
	p3sim.io.lcd.onStateChange(function(text, active) {
		if (!active || !text) {
			$board_lcd.val("");
		} else if (text) {
			$board_lcd.val(text.join("\n"));
		}
	});
	p3sim.io.lcd.onTextChange(function(text, active, x, y) {
		$board_lcd.val(text.join("\n"));
	});
	p3sim.io.leds.onStateChange(function(value) {
		for (var i = 0; i < 16; i++) {
			if (((value << i) & 0x8000) == 0) {
				leds$array[i].removeClass("on");
			} else {
				leds$array[i].addClass("on");
			}
		}
	});

}
