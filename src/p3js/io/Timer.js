export class Timer {
  constructor(simulator, int) {
    this._simulator = simulator;
    int = (int === undefined ? 15 : int);
    this._value = 0;
    this._state = 0;
    this._interval = 0;

    this._timerFn = (() => {
      if (this._value <= 0) {
        this._control(0);
        simulator.interrupt(int);
      } else {
        this._value--;
      }
    });
  }

  _control(v) {
    if ((v & 0x1) === 0) {
      clearInterval(this._interval);
      this._state = 0;
      this._interval = 0;
    } else if (this._state === 0) {
      this._state = 1;
      this._interval = setInterval(this._timerFn, 100);
    }
  }

  bindHandlers(addrValue, addrControl) {
    this._simulator._ioc.registerReadHandler(addrValue || 0xfff6, () => {
      return this._value;
    });
    this._simulator._ioc.registerReadHandler(addrControl || 0xfff7, () => {
      return this._state;
    });
    this._simulator._ioc.registerWriteHandler(addrValue || 0xfff6, (value) => {
      this._value = value;
    });
    this._simulator._ioc.registerWriteHandler(addrControl || 0xfff7, (value) => {
      this._control(value);
    });
  }

  reset() {
    this._value = 0;
    this._control(0);
  }
}
