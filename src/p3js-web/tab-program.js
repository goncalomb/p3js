module.exports = function(share, p3sim) {

	var $prog_mem_info = $("#prog-mem-info");
	var $prog_memory_footprint = $("#prog-memory-footprint");
	var $prog_label_info = $("#prog-label-info");
	var $prog_labels = $("#prog-labels");

	var MemoryFootprintChart = require("./MemoryFootprintChart.js");
	var mfc = new MemoryFootprintChart($prog_memory_footprint[0]);
	mfc.addLabel("Empty");
	mfc.addLabel("WORD", "#12d");
	mfc.addLabel("STR", "#2d1");
	mfc.addLabel("TAB", "#d21");
	mfc.addLabel("Instructions", "#222");

	share.clearProgramInfo = function() {
		$prog_mem_info.text("");
		$prog_label_info.text("");
		mfc.clear();
		$prog_labels.html("<em>Assemble a program first.</em>\n");
	}

	share.buildProgramInfo = function(data) {
		var memory_percent = Math.floor(data.memoryUsage*10000/p3js.constants.MEMORY_SIZE)/100;
		$prog_mem_info.text(data.memoryUsage + "/" + p3js.constants.MEMORY_SIZE + " (" + memory_percent + "%) used");
		$prog_label_info.text(data.labelCount);
		var references = [];
		for (var label in data.labels) {
			var l = label + " ";
			if (l.length < 24) {
				l += Array(24 - l.length + 1).join(" ");
			}
			var v = data.labels[label].toString(16);
			if (v.length < 4) {
				v = Array(4 - v.length + 1).join("0") + v;
			}
			references.push(l + v + "\n");
		}
		$prog_labels.text(references.join(""));
		data.usedAddresses.forEach(function(value, i) {
			if (value == 1) {
				mfc.drawSquare(i, "#222");
			} else if (value == 2) {
				mfc.drawSquare(i, "#12d");
			} else if (value == 3) {
				mfc.drawSquare(i, "#2d1");
			} else if (value == 4) {
				mfc.drawSquare(i, "#d21");
			} else {
				mfc.drawSquare(i);
			}
		});
	}
	share.clearProgramInfo();

};
