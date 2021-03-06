export class InfoPanel {
  constructor(simulator, element) {
    this._simulator = simulator;
    this._element = element;

    simulator.registerEventHandler('stop', (c, i, s) => {
      this._update(c, i, s);
    });
    simulator.registerEventHandler('clock', (c, i, s) => {
      this._update(c, i, s);
    });
    simulator.registerEventHandler('reset', () => {
      this._update(0, 0, 0);
    });

    this._update(0, 0, 0);
  }

  _update(c, i, s) {
    let s_str;
    if (s >= 1000000) {
      s_str = Math.round(s / 100000) / 10 + ' MHz';
    } else if (s >= 1000) {
      s_str = Math.round(s / 100) / 10 + ' kHz';
    } else {
      s_str = Math.round(s * 10) / 10 + ' Hz';
    }
    this._element.innerHTML = 'Speed: ' + s_str + '\n'
      + 'Clock: ' + c.toLocaleString() + '\n'
      + 'Instructions: ' + i.toLocaleString() + '\n';
  }
}
