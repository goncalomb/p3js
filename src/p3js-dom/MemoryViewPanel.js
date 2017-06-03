var MemoryViewPanel = module.exports = function(p3sim, $area, begin, end) {
	this._p3sim = p3sim;
	this._$area = $area;
	this._begin = begin;
	this._end = end;

	var self = this;

	this._p3sim.registerEventHandler("memory", function(addr) {
		if (addr === null || (addr >= self._begin && addr < self._end)) {
			self.update();
		}
	});

	self.update();
}

MemoryViewPanel.prototype.promptRange = function() {
	var regex = /^([0-9a-f]{1,4})\s?:\s?([0-9a-f]{1,4})$/i;
	var value = ("000" + this._begin.toString(16)).substr(-4) + ":" + ("000" + (this._end - 1).toString(16)).substr(-4);
	value = prompt("New memory range:", value);
	while (true) {
		if (!value) {
			return;
		} else {
			var matches = value.match(regex);
			if (matches) {
				var b = parseInt(matches[1], 16);
				var e = parseInt(matches[2], 16);
				if (e >= b) {
					this._begin = b;
					this._end = e + 1;
					this.update();
					return;
				}
			}
		}
		value = prompt("Invalid range. New memory range:", value);
	}
}

MemoryViewPanel.prototype.update = function() {
	var mem_view = this._p3sim._ram._memoryView;
	var arr = [];
	for (var i = this._begin, l = this._end; i < l; ) {
		var line = "";
		var ascii = "";
		line += ("000" + i.toString(16)).substr(-4) + " : ";
		for (var j = 0; j < 8 && i < l; j++, i++) {
			var v = mem_view.getInt16(i * 2, true) & 0xffff;
			line += ("000" + v.toString(16)).substr(-4) + " ";
			if (v > 32 && v < 127) {
				// only printable characters
				ascii += String.fromCharCode(v);
			} else {
				ascii += ".";
			}
		}
		line += ascii + "\n";
		arr.push(line);
	}
	this._$area.val(arr.join(""));
}
