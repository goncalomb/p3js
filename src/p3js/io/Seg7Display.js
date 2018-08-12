export class Seg7Display {
  constructor(simulator) {
    this._simulator = simulator;
    this._onStateChange = null;
    this._value = 0;
  }

  _set(value, mask) {
    this._value = (this._value & mask) | value;
    if (this._onStateChange) this._onStateChange(this._value);
  }

  bindHandlers(addrControl0, addrControl1, addrControl2, addrControl3) {
    this._simulator._ioc.registerWriteHandler(addrControl0 || 0xfff0, (value) => {
      this._set(value & 0xf, 0xfff0);
    });
    this._simulator._ioc.registerWriteHandler(addrControl1 || 0xfff1, (value) => {
      this._set((value & 0xf) << 4, 0xff0f);
    });
    this._simulator._ioc.registerWriteHandler(addrControl2 || 0xfff2, (value) => {
      this._set((value & 0xf) << 8, 0xf0ff);
    });
    this._simulator._ioc.registerWriteHandler(addrControl3 || 0xfff3, (value) => {
      this._set((value & 0xf) << 12, 0x0fff);
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
