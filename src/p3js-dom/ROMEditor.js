var ROMEditor = module.exports = function(p3sim, n, $contents, $changes) {
	this._rw = new p3js.ROMReaderWriter(p3sim, n);
	this._$contents = $contents;
	this._$changes = $changes;
	this._dump();
}

ROMEditor.prototype._dump = function() {
	this._$contents.val(this._rw.dumpROMContents());
}

ROMEditor.prototype.save = function() {
	try {
		this._rw.overwriteROMContents(this._$changes.val());
	} catch (e) {
		if (typeof e == "string") {
			alert("Error: " + e);
			return;
		} else {
			throw e;
		}
	}
	this._dump();
	alert("Done.");
}
