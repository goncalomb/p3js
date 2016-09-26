var MemoryViewPanel = module.exports = function($area, begin, end) {
	this._$area = $area;
	this._begin = begin;
	this._end = end;
}

MemoryViewPanel.prototype.updateConditionally = function(data_view, addr) {
	if (addr === null || (addr >= this._begin && addr < this._end)) {
		this.update(data_view);
	}
}

MemoryViewPanel.prototype.update = function(data_view) {
	var arr = [];
	for (var i = this._begin, l = this._end; i < l; ) {
		var line = "";
		var ascii = "";
		line += ("000" + i.toString(16)).substr(-4) + " : ";
		for (var j = 0; j < 8 && i < l; j++, i++) {
			var v = data_view.getInt16(i * 2, true) & 0xffff;
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
