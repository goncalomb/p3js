var IOBoard = module.exports = function(p3sim) {
	this._$board = $("#io-board");
	this._$board_lcd = $("#io-board-lcd");
	this._$board_leds = $("#io-board-leds");
	this._$board_7seg = $("#io-board-7seg");
	this._$board_buttons = $("#io-board-buttons");
	this._$board_switches = $("#io-board-switches");
	this._leds$array = $();

	var self = this;

	for (var i = 0; i < 16; i++) {
		this._leds$array.push($("<span>").appendTo(this._$board_leds));
	}

	this._$board_7seg.text("0000");

	function create_button_row(arr) {
		var $div = $("<div>");
		arr.forEach(function(i) {
			$("<button>").addClass("btn btn-xs").text("I" + i.toString(16).toUpperCase()).click(function() {
				p3sim.interrupt(i);
			}).appendTo($div);
		});
		$div.appendTo(self._$board_buttons);
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
		}).appendTo(self._$board_switches);
	}
	for (var i = 0; i < 8; i++) {
		create_switch(i);
	}

	p3sim.io.seg7.onStateChange(function(value) {
		self._$board_7seg.text(("0000" + value.toString(16)).substr(-4));
	});
	p3sim.io.lcd.onStateChange(function(text, active) {
		if (!active || !text) {
			self._$board_lcd.val("");
		} else if (text) {
			self._$board_lcd.val(text.join("\n"));
		}
	});
	p3sim.io.lcd.onTextChange(function(text, active, x, y) {
		self._$board_lcd.val(text.join("\n"));
	});
	p3sim.io.leds.onStateChange(function(value) {
		for (var i = 0; i < 16; i++) {
			if (((value << i) & 0x8000) == 0) {
				self._leds$array[i].removeClass("on");
			} else {
				self._leds$array[i].addClass("on");
			}
		}
	});
}
