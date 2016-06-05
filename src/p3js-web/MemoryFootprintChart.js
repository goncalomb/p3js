var MemoryFootprintChart = module.exports = function(canvas) {
	this._canvas = canvas;
	this._labelDx = 5;
	// canvas style
	this._canvas.width = this.constructor.WIDTH;
	this._canvas.height = this.constructor.HEIGHT;
	// initialize
	this._ctx = this._canvas.getContext("2d");
	this._ctx.textBaseline = "top";
	this._ctx.font = "12px monospace";
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
