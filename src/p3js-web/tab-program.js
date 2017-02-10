/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

var p3js_web = require(".");

module.exports = function(p3sim) {

	var $prog_mem_info = $("#prog-mem-info");
	var $prog_memory_footprint = $("#prog-memory-footprint");
	var $prog_label_info = $("#prog-label-info");
	var $prog_labels = $("#prog-labels");

	var MemoryFootprintChart = require("../p3js-dom/MemoryFootprintChart.js");
	var mfc = new MemoryFootprintChart($prog_memory_footprint[0]);

	var MEMORY_SIZE = p3js.devices.RAM.MEMORY_SIZE;

	p3js_web.clearProgramInfo = function() {
		$prog_mem_info.text("");
		$prog_label_info.text("");
		mfc.clear();
		$prog_labels.html("<em>Assemble a program first.</em>\n");
	}

	p3js_web.buildProgramInfo = function(data) {
		var memory_percent = Math.floor(data.memoryUsage*10000/MEMORY_SIZE)/100;
		$prog_mem_info.text(data.memoryUsage + "/" + MEMORY_SIZE + " (" + memory_percent + "%) used");
		mfc.displayData(data);
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
	}
	p3js_web.clearProgramInfo();

};
