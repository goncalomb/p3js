/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

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
	mfc.addLabel("INT Vector (using default ROM C)", "#fb1");
	mfc.addLabel("IO Addresses (reserved)", "#b1f");

	var MEMORY_SIZE = p3js.devices.RAM.MEMORY_SIZE;
	var IO_FIRST_ADDRESS = p3js.devices.IOC.IO_FIRST_ADDRESS;
	var INTERRUPT_COUNT = p3js.devices.PIC.INTERRUPT_COUNT;

	share.clearProgramInfo = function() {
		$prog_mem_info.text("");
		$prog_label_info.text("");
		mfc.clear();
		$prog_labels.html("<em>Assemble a program first.</em>\n");
	}

	share.buildProgramInfo = function(data) {
		var memory_percent = Math.floor(data.memoryUsage*10000/MEMORY_SIZE)/100;
		$prog_mem_info.text(data.memoryUsage + "/" + MEMORY_SIZE + " (" + memory_percent + "%) used");
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
		for (var i = p3js.constants.INTERRUPT_VECTOR_ADDRESS, l = i + INTERRUPT_COUNT; i < l; i++) {
			mfc.drawSquare(i, "#fb1");
		}
		for (var i = IO_FIRST_ADDRESS; i < MEMORY_SIZE; i++) {
			mfc.drawSquare(i, "#b1f");
		}
		data.usedAddresses.forEach(function(value, i) {
			if (value == 1) {
				mfc.drawSquare(i, "#222");
			} else if (value == 2) {
				mfc.drawSquare(i, "#12d");
			} else if (value == 3) {
				mfc.drawSquare(i, "#2d1");
			} else if (value == 4) {
				mfc.drawSquare(i, "#d21");
			} else if (i < p3js.constants.INTERRUPT_VECTOR_ADDRESS) {
				mfc.drawSquare(i);
			}
		});
	}
	share.clearProgramInfo();

};
