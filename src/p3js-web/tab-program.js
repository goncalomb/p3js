module.exports = function(share, p3sim) {

	var $prog_mem_info = $("#prog-mem-info");
	var $prog_memory_footprint = $("#prog-memory-footprint");
	var $prog_label_info = $("#prog-label-info");
	var $prog_labels = $("#prog-labels");

	// XXX: refactor canvas code
	var mem_footprint_ctx = $prog_memory_footprint[0].getContext("2d");
	mem_footprint_ctx.textBaseline = "top";
	mem_footprint_ctx.font = "12px monospace";
	var mfl_dx = 5;
	function draw_canvas_label(name, color) {
		mem_footprint_ctx.fillStyle = color;
		mem_footprint_ctx.fillRect(mfl_dx, 256 + 5, 10, 10);
		mem_footprint_ctx.fillStyle = "#222";
		mem_footprint_ctx.fillText(name, mfl_dx + 12, 256 + 4);
		mfl_dx += mem_footprint_ctx.measureText(name).width + 30;
	}
	share.clearProgramInfo = function() {
		$prog_mem_info.text("");
		$prog_label_info.text("");
		$prog_labels.html("<em>Assemble a program first.</em>\n");
		mem_footprint_ctx.clearRect(0, 0, 1024, 256);
		mem_footprint_ctx.fillText("Assemble a program first.", 5, 5);
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
			var x = (i%512);
			var y = Math.floor(i/512);
			if (value == 1) {
				mem_footprint_ctx.fillStyle = "#222";
			} else if (value == 2) {
				mem_footprint_ctx.fillStyle = "#12d";
			} else if (value == 3) {
				mem_footprint_ctx.fillStyle = "#2d1";
			} else if (value == 4) {
				mem_footprint_ctx.fillStyle = "#d21";
			} else if (i%2 == y%2) {
				mem_footprint_ctx.fillStyle = "#ddd";
			} else {
				mem_footprint_ctx.fillStyle = "#eee";
			}
			mem_footprint_ctx.fillRect(x*2, y*2, 2, 2);
		});
	}
	share.clearProgramInfo();
	draw_canvas_label("Empty", "#d7d7d7");
	draw_canvas_label("WORD", "#12d");
	draw_canvas_label("STR", "#2d1");
	draw_canvas_label("TAB", "#d21");
	draw_canvas_label("Instructions", "#222");

};
