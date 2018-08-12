var p3js = require("./");

export class SimulatorWithIO extends p3js.Simulator {
  constructor() {
    super();
    this.io = { };
    this.io.seg7 = new p3js.io.Seg7Display(this);
    this.io.seg7.bindHandlers();
    this.io.lcd = new p3js.io.LCD(this);
    this.io.lcd.bindHandlers();
    this.io.timer = new p3js.io.Timer(this);
    this.io.timer.bindHandlers();
    this.io.leds = new p3js.io.Leds(this);
    this.io.leds.bindHandlers();
    this.io.switches = new p3js.io.Switches(this);
    this.io.switches.bindHandlers();
    this.io.terminal = new p3js.io.Terminal(this);
    this.io.terminal.bindHandlers();
  }

  reset() {
    super.reset();
    this.io.seg7.reset();
    this.io.lcd.reset();
    this.io.timer.reset();
    this.io.leds.reset();
    this.io.switches.reset();
    this.io.terminal.reset();
  }
}
