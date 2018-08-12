export class Switches {
  constructor(simulator) {
    this._simulator = simulator;
    this._value = 0;
  }

  bindHandlers(addrControl) {
    this._simulator._ioc.registerReadHandler(addrControl || 0xfff9, () => {
      return this._value;
    });
  }

  set(i) {
    this._value |= (1 << i);
  }

  unset(i) {
    this._value &= ~(1 << i);
  }

  toggle(i) {
    this._value ^= (1 << i);
  }

  reset() {
    this._value = 0;
  }
}
