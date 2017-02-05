var p3js = require("./");

var SimulatorWithIO = module.exports = p3js.inherit(p3js.Simulator, function() {
	this.constructor._super.call(this);
	this.io = { };
	this.io.seg7 = new (require("../p3js-io/Seg7Display.js"))(this);
	this.io.seg7.bindHandlers();
	this.io.lcd = new (require("../p3js-io/LCD.js"))(this);
	this.io.lcd.bindHandlers();
	this.io.timer = new (require("../p3js-io/Timer.js"))(this);
	this.io.timer.bindHandlers();
	this.io.leds = new (require("../p3js-io/Leds.js"))(this);
	this.io.leds.bindHandlers();
	this.io.switches = new (require("../p3js-io/Switches.js"))(this);
	this.io.switches.bindHandlers();
	this.io.terminal = new (require("../p3js-io/Terminal.js"))(this);
	this.io.terminal.bindHandlers();
});

SimulatorWithIO.prototype.reset = function() {
	this.constructor._super.prototype.reset.call(this);
	this.io.seg7.reset();
	this.io.lcd.reset();
	this.io.timer.reset();
	this.io.leds.reset();
	this.io.switches.reset();
	this.io.terminal.reset();
}
