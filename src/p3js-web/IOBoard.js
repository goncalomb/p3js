var IOBoard = module.exports = function(p3sim) {
	this._$board = $("#io-board");
	this._$board_lcd = $("#io-board-lcd");
	this._$board_leds = $("#io-board-leds");
	this._$board_7seg = $("#io-board-7seg");
	this._$board_buttons = $("#io-board-buttons");
	this._$board_switches = $("#io-board-switches");
	this._leds$array = $();

	this.reset();
	var self = this;

	for (var i = 0; i < 16; i++) {
		this._leds$array.push($("<span>").appendTo(this._$board_leds));
	}

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
				self._switches_value &= ~(1 << (7 - i));
			} else {
				$this.addClass("on");
				self._switches_value |= 1 << (7 - i);
			}
		}).appendTo(self._$board_switches);
	}
	for (var i = 0; i < 8; i++) {
		create_switch(i);
	}
}

IOBoard.prototype.reset = function() {
	this._$board_lcd.val("");
	this._$board_leds.find(".on").removeClass("on");
	this._$board_7seg.text("0000");
	this._$board_switches.children().removeClass("on");
	this._lcd_active = true;
	this._lcd_x = 0;
	this._lcd_y = 0;
	this._lcd_text = null;
	this._7seg_value = 0;
	this._switches_value = 0;
}

IOBoard.prototype.lcdControl = function(v) {
	if ((v & 0x20) != 0) {
		this._$board_lcd.val("");
		this._lcd_text = null;
	}
	if ((v & 0x8000) == 0) {
		this._$board_lcd.val("");
		this._lcd_active = false;
	} else {
		if (!this._lcd_active && this._lcd_text) {
			this._$board_lcd.val(this._lcd_text.join("\n"));
		}
		this._lcd_active = true;
	}
	this._lcd_x = v & 0xf;
	this._lcd_y = v >> 4 & 0x1;
}

IOBoard.prototype.lcdWrite = function(v) {
	if (!this._lcd_text) {
		this._lcd_text = [
			Array(16 + 1).join(" "),
			Array(16 + 1).join(" ")
		];
	}
	var str = this._lcd_text[this._lcd_y];
	str = str.substr(0, this._lcd_x) + String.fromCharCode(v) + str.substr(this._lcd_x + 1, str.length);
	this._lcd_text[this._lcd_y] = str;
	if (this._lcd_active) {
		this._$board_lcd.val(this._lcd_text.join("\n"));
	}
}

IOBoard.prototype.leds = function(v) {
	for (var i = 0; i < 16; i++) {
		if (((v << i) & 0x8000) == 0) {
			this._leds$array[i].removeClass("on");
		} else {
			this._leds$array[i].addClass("on");
		}
	}
}

IOBoard.prototype.set7Segment = function(v, mask) {
	this._7seg_value = (this._7seg_value & mask) | v;
	this._$board_7seg.text(("0000" + this._7seg_value.toString(16)).substr(-4));
}

IOBoard.prototype.switches = function() {
	return this._switches_value;
}
