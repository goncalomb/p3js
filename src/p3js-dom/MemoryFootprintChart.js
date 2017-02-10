var INTERRUPT_VECTOR_ADDRESS = p3js.devices.CPU.INTERRUPT_VECTOR_ADDRESS;
var MEMORY_SIZE = p3js.devices.RAM.MEMORY_SIZE;
var IO_FIRST_ADDRESS = p3js.devices.IOC.IO_FIRST_ADDRESS;
var INTERRUPT_COUNT = p3js.devices.PIC.INTERRUPT_COUNT;

var MemoryFootprintChart = module.exports = function(canvas) {
	this._canvas = canvas;
	this._labelDx = 5;

	this._canvas.width = this.constructor.WIDTH;
	this._canvas.height = this.constructor.HEIGHT;

	this._ctx = this._canvas.getContext("2d");
	this._ctx.textBaseline = "top";
	this._ctx.font = "12px monospace";

	this.addLabel("Empty");
	this.addLabel("WORD", "#12d");
	this.addLabel("STR", "#2d1");
	this.addLabel("TAB", "#d21");
	this.addLabel("Instructions", "#222");
	this.addLabel("INT Vector (using default ROM C)", "#fb1");
	this.addLabel("IO Addresses (reserved)", "#b1f");

	this.clear();
};

MemoryFootprintChart.WIDTH = 1024;
MemoryFootprintChart.HEIGHT = 276;
MemoryFootprintChart.SIZE = (1 << 16);

MemoryFootprintChart.prototype.clear = function() {
	this._ctx.clearRect(0, 0, 1024, 256);
	this._ctx.fillStyle = "#222";
	this._ctx.fillText("Assemble a program first.", 5, 5);
}

MemoryFootprintChart.prototype.addLabel = function(name, color) {
	this._ctx.fillStyle = (color ? color : "#d7d7d7");
	this._ctx.fillRect(this._labelDx, 256 + 5, 10, 10);
	this._ctx.fillStyle = "#222";
	this._ctx.fillText(name, this._labelDx + 12, 256 + 4);
	this._labelDx += this._ctx.measureText(name).width + 30;
};

MemoryFootprintChart.prototype.drawSquare = function(i, color) {
	if (i >= 0 && i < this.constructor.SIZE) {
		var x = (i%512);
		var y = Math.floor(i/512);
		if (color) {
			this._ctx.fillStyle = color;
		} else if (i%2 == y%2) {
			this._ctx.fillStyle = "#ddd";
		} else {
			this._ctx.fillStyle = "#eee";
		}
		this._ctx.fillRect(x*2, y*2, 2, 2);
	}
}

MemoryFootprintChart.prototype.displayData = function(assemblerResult) {
	for (var i = INTERRUPT_VECTOR_ADDRESS, l = i + INTERRUPT_COUNT; i < l; i++) {
		this.drawSquare(i, "#fb1");
	}
	for (var i = IO_FIRST_ADDRESS; i < MEMORY_SIZE; i++) {
		this.drawSquare(i, "#b1f");
	}
	var self = this;
	assemblerResult.usedAddresses.forEach(function(value, i) {
		if (value == 1) {
			self.drawSquare(i, "#222");
		} else if (value == 2) {
			self.drawSquare(i, "#12d");
		} else if (value == 3) {
			self.drawSquare(i, "#2d1");
		} else if (value == 4) {
			self.drawSquare(i, "#d21");
		} else if (i < INTERRUPT_VECTOR_ADDRESS) {
			self.drawSquare(i);
		}
	});
}
