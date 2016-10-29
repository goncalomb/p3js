var p3js_devices = require("./devices");

var Simulator = module.exports = function() {
	this._eventHandlers = { };
	this._busDevices = [ ];
	this._cpu = new p3js_devices.CPU(this._busDevices);
	this._ram = new p3js_devices.RAM(this);
	this._ioc = new p3js_devices.IOC();
	this._pic = new p3js_devices.PIC(this._cpu);
	this._busDevices.push(this._pic);
	this._busDevices.push(this._ioc);
	this._busDevices.push(this._ram);
	this._resetVariables();
}

Simulator.prototype._resetVariables = function() {
	this._interval = 0;
	this._oneInstruction = false;
	this._speed = 0;
}

Simulator.prototype._fireEvent = function(name, args) {
	if (this._eventHandlers[name]) {
		var sim = this;
		this._eventHandlers[name].forEach(function(fn) {
			fn.apply(sim, args);
		});
	}
}

Simulator.prototype._fireStatusEvent = function(name) {
	this._fireEvent(name, [this._cpu._clockCount, this._cpu._instructionCount, this._speed]);
}

Simulator.prototype.reset = function() {
	this.stop();
	this._cpu.reset();
	this._resetVariables();
	this._fireEvent("memory", [null]);
	this._fireEvent("reset");
}

Simulator.prototype.registerEventHandler = function(name, fn) {
	if (typeof fn == "function") {
		if (!this._eventHandlers[name]) {
			this._eventHandlers[name] = [];
		}
		this._eventHandlers[name].push(fn);
	}
}

Simulator.prototype.setIOHandlers = function(read, write) {
	for (var key in read) {
		this._ioc.registerReadHandler(key, read[key]);
	}
	for (var key in write) {
		this._ioc.registerWriteHandler(key, write[key]);
	}
}

Simulator.prototype.loadMemory = function(buffer) {
	this.stop();
	this._ram.load(buffer)
	this.reset();
	this._fireEvent("load");
}

Simulator.prototype.interrupt = function(i) {
	this._pic.triggerInterrupt(i);
}

Simulator.prototype.start = function() {
	if (!this._interval) {
		var sim = this;
		// start loop
		var m = 1;
		var s = ss = 0;
		var t0 = Date.now();
		this._interval = setInterval(function() {
			try {
				for (var i = 0; i < m; i++) {
					if (sim._cpu.clock() && sim._oneInstruction) {
						// stop simulation if just running one instruction
						sim._fireStatusEvent("clock");
						sim.stop();
						return;
					}
				}
			} catch (e) {
				sim.stop();
				throw e;
			}
			// find time
			var t1 = Date.now();
			var td = t1 - t0 + 1; // + 1 to avoid divide by zero
			t0 = t1;
			// calculate speed with 20 samples
			if (s == 20) {
				ss -= ss/s; // remove mean
			} else {
				s++;
			}
			ss += (m*1000)/td; // add speed
			sim._speed = ss/s;
			// fire clock event
			sim._fireStatusEvent("clock");
			// ajust m to keep loop within 30ms
			m += Math.max(1, Math.floor((30 - td) * 0.8 / (td/m)));
		});
		this._fireStatusEvent("start");
	}
}

Simulator.prototype.stepInstruction = function() {
	this._oneInstruction = true;
	this.start();
}

Simulator.prototype.stepClock = function() {
	this.stop();
	this._cpu.clock();
	this._fireStatusEvent("clock");
}

Simulator.prototype.isRunning = function() {
	return !!this._interval;
}

Simulator.prototype.stop = function() {
	if (this._interval) {
		clearInterval(this._interval);
		this._interval = 0;
		this._oneInstruction = false;
		this._speed = 0;
		this._fireStatusEvent("stop");
	}
}
