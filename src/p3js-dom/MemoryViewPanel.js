import { MemoryRangePanel } from './MemoryRangePanel.js';

export class MemoryViewPanel extends MemoryRangePanel {
  constructor(simulator, textarea, begin, end) {
    super(begin, end);
    this._simulator = simulator;
    this._textarea = textarea;

    this._simulator.registerEventHandler('memory', (addr) => {
      if (addr === null || (addr >= this._begin && addr < this._end)) {
        this.update();
      }
    });

    this.update();
  }

  scrollToStart() {
    this._textarea.scrollTop = 0;
  }

  scrollToEnd() {
    this._textarea.scrollTop = this._textarea.scrollHeight;
  }

  update() {
    let mem_view = this._simulator._ram._memoryView;
    let arr = [];
    for (let i = this._begin, l = this._end; i <= l;) {
      let line = '';
      let ascii = '';
      line += i.toString(16).padStart(4, '0') + ' : ';
      for (let j = 0; j < 8 && i <= l; j++, i++) {
        let v = mem_view.getInt16(i * 2, true) & 0xffff;
        line += v.toString(16).padStart(4, '0') + ' ';
        if (v > 32 && v < 127) {
          // only printable characters
          ascii += String.fromCharCode(v);
        } else {
          ascii += '.';
        }
      }
      line += ascii;
      arr.push(line);
    }
    this._textarea.value = arr.join('\n');
  }
}
