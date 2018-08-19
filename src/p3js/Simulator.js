import * as devices from './devices/';

let timeNow = Date.now;
if (typeof window != 'undefined' && window.performance != 'undefined') {
  // for web
  timeNow = window.performance.now.bind(window.performance);
} else if (typeof require != 'undefined') {
  // for node
  // XXX: this is a hack for webpack to trick it into building the web bundle
  //      by hiding the fact that are calling node's require
  //      this is needed because these classes are also used for the node programs
  //      maybe we should just use Date.now everywhere?!
  let foo = { bar: require };
  timeNow = foo.bar('perf_hooks').performance.now;
}

export class Simulator {
  constructor() {
    this._eventHandlers = { };
    this._busDevices = [];
    this._cpu = new devices.CPU(this._busDevices);
    this._ram = new devices.RAM(this);
    this._ioc = new devices.IOC();
    this._pic = new devices.PIC(this._cpu);
    this._busDevices.push(this._pic);
    this._busDevices.push(this._ioc);
    this._busDevices.push(this._ram);
    this._speedFactor = 1;
    this._resetVariables();
  }

  _resetVariables() {
    this._interval = 0;
    this._oneInstruction = false;
    this._speed = 0;
  }

  _fireEvent(name, args) {
    if (this._eventHandlers[name]) {
      let sim = this;
      this._eventHandlers[name].forEach((fn) => {
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
    this._ram.load(buffer);
    this.reset();
    this._fireEvent("load");
  }

  interrupt(i) {
    this._pic.triggerInterrupt(i);
  }

  setSpeedFactor(factor) {
    this._speedFactor = factor;
  }

  start() {
    if (!this._interval) {
      // clock sample variables
      let cs_count = 0;
      let cs_time = 0;
      // loop sample variables
      let ls_count = 0;
      let ls_speed = 0;

      // iterations to perform
      let it = 1;

      let t0 = timeNow();
      this._interval = setInterval(() => {
        // adjust number of iterations
        let it_adjusted = it*this._speedFactor + 1;

        // do the work
        let t1 = timeNow();
        try {
          for (let i = 0; i < it_adjusted; i++) {
            if (this._cpu.clock() && this._oneInstruction) {
              // stop simulation if just running one instruction
              this._fireStatusEvent('clock');
              this.stop();
              return;
            }
          }
        } catch (e) {
          this.stop();
          throw e;
        }
        let t2 = timeNow();

        let time_full = t2 - t0; // loop duration
        let time_work = t2 - t1; // work duration
        t0 = t2;

        // calculate real clock speed with 20 loop samples
        if (ls_count == 20) {
          ls_speed -= ls_speed/ls_count; // remove mean
        } else {
          ls_count++;
        }
        ls_speed += it_adjusted*1000/(time_full + 0.01); // use 0.01 to prevent division by 0
        this._speed = ls_speed/ls_count; // Hz

        // calculate clock speed with 100 clock samples
        cs_count += it_adjusted;
        cs_time += time_work;
        if (cs_count > 1000) {
          cs_time -= (cs_count - 1000)*(cs_time/cs_count); // remove mean
          cs_count = 1000;
        }

        // adjust iterations to keep loop close to 20ms (use 0.01 to prevent division by 0)
        it = 20*cs_count/(cs_time + 0.01); // == 20/(cs_time/cs_count)

        // fire clock event
        this._fireStatusEvent('clock');
      }, 20);
      this._fireStatusEvent('start');
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
