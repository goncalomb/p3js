var p3js = require("../");
var p3js_devices_RAM = require("../devices/RAM.js");

var MEMORY_SIZE = p3js_devices_RAM.MEMORY_SIZE;
var MEMORY_WORD_SIZE = p3js_devices_RAM.MEMORY_WORD_SIZE;

var AssemblerResult = module.exports = function() {
	this.buffer = new ArrayBuffer(MEMORY_SIZE * MEMORY_WORD_SIZE);
	this.usedAddresses = Array.apply(null, Array(MEMORY_SIZE)).map(Number.prototype.valueOf, 0);
	this.memoryUsage = 0;
	this.labels = { };
	this.labelCount = 0;
	this.pseudoCount = 0;
	this.instructionCount = 0;
}

AssemblerResult.prototype.getMemoryUsagePercentage = function() {
	return Math.floor(this.memoryUsage*10000/MEMORY_SIZE)/100;
}

AssemblerResult.prototype.getMemoryUsageString = function() {
	return this.memoryUsage + "/" + MEMORY_SIZE + " (" + this.getMemoryUsagePercentage() + "%)";
}

AssemblerResult.prototype.buildProgramCode = function(oldFormat) {
	return p3js.writeObjectFormat(this.buffer, oldFormat, this.usedAddresses);
}
