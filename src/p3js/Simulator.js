import * as devices from './devices/';

export class Simulator {
  constructor() {
    this._eventHandlers = { };
    this._busDevices = [ ];
    this._cpu = new devices.CPU(this._busDevices);
    this._ram = new devices.RAM(this);
    this._ioc = new devices.IOC();
    this._pic = new devices.PIC(this._cpu);
    this._busDevices.push(this._pic);
    this._busDevices.push(this._ioc);
    this._busDevices.push(this._ram);
    this._resetVariables();
  }

  _resetVariables() {
    this._interval = 0;
    this._oneInstruction = false;
    this._speed = 0;
  }

  _fireEvent(name, args) {
    if (this._eventHandlers[name]) {
      var sim = this;
      this._eventHandlers[name].forEach(function(fn) {
        fn.apply(sim, args);
      });
    }
  }

  _fireStatusEvent(name) {
    this._fireEvent(name, [this._cpu._clockCount, this._cpu._instructionCount, this._speed]);
  }

  reset() {
    this.stop();
    this._cpu.reset();
    this._resetVariables();
    this._fireEvent("memory", [null]);
    this._fireEvent("reset");
  }

  registerEventHandler(name, fn) {
    if (typeof fn == "function") {
      if (!this._eventHandlers[name]) {
        this._eventHandlers[name] = [];
      }
      this._eventHandlers[name].push(fn);
    }
  }

  loadMemory(buffer) {
    this.stop();
    this._ram.load(buffer)
    this.reset();
    this._fireEvent("load");
  }

  interrupt(i) {
    this._pic.triggerInterrupt(i);
  }

  start() {
    if (!this._interval) {
      var sim = this;
      // start loop
      var m = 1;
      var s = 0;
      var ss = 0;
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
      }, 10);
      this._fireStatusEvent("start");
    }
  }

  stepInstruction() {
    this._oneInstruction = true;
    this.start();
  }

  stepClock() {
    this.stop();
    this._cpu.clock();
    this._fireStatusEvent("clock");
  }

  isRunning() {
    return !!this._interval;
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = 0;
      this._oneInstruction = false;
      this._speed = 0;
      this._fireStatusEvent("stop");
    }
  }
}
