export class DebugPanel {
  constructor(simulator, textarea) {
    this._simulator = simulator;
    this._textarea = textarea;

    this._simulator.registerEventHandler('clock', () => {
      this.update();
    });
    this._simulator.registerEventHandler('reset', () => {
      this.update();
    });

    this.showCtrl(false);
  }

  showCtrl(show) {
    this._showCtrl = !!show;
    this._textarea.rows = (this._showCtrl ? 26 : 14);
    this.update();
  }

  update() {
    let cpu = this._simulator._cpu;
    let text = [];

    for (let i = 0; i < 8; i++) {
      text.push('R' + i + ':  ' + cpu.getRegister(i).toString(16).padStart(4, '0'));
    }
    text.push('');

    if (this._showCtrl) {
      for (let i = 8; i < 14; i++) {
        text.push('R' + i + ': ' + (i < 10 ? ' ' : '') + cpu.getRegister(i).toString(16).padStart(4, '0'));
      }
    }
    text.push('SP:  ' + cpu.SP.toString(16).padStart(4, '0'));
    text.push('PC:  ' + cpu.PC.toString(16).padStart(4, '0'));
    text.push('');

    if (this._showCtrl) {
      text.push('CAR: ' + cpu.CAR.toString(16).padStart(4, '0'));
      text.push('SBR: ' + cpu.SBR.toString(16).padStart(4, '0'));
      text.push('RI:  ' + cpu.RI.toString(16).padStart(4, '0'));
      text.push('INT: ' + cpu.INT);
      text.push('IAK: ' + cpu.IAK);
      text.push('');
      text.push(' zcEZCNO');
      text.push(' ' + cpu.RE.toString(2).padStart(7, '0'));
    } else {
      text.push('  EZCNO');
      text.push('  ' + (cpu.RE & 0x1f).toString(2).padStart(5, '0'));
    }

    this._textarea.value = text.join('\n');
  }
}
