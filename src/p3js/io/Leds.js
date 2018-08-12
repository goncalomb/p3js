export class Leds {
  constructor(simulator) {
    this._simulator = simulator;
    this._onStateChange = null;
    this._value = 0;
  }

  bindHandlers(addrControl) {
    this._simulator._ioc.registerWriteHandler(addrControl || 0xfff8, (value) => {
      this._value = value;
      if (this._onStateChange) this._onStateChange(this._value);
    });
  }

  onStateChange(fn) {
    this._onStateChange = fn;
  }

  reset() {
    this._value = 0;
    if (this._onStateChange) this._onStateChange(this._value);
  }
}
