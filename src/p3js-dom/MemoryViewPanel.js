export class MemoryViewPanel {
  constructor(simulator, $area, begin, end) {
    this._simulator = simulator;
    this._$area = $area;
    this._begin = begin;
    this._end = end;

    this._simulator.registerEventHandler('memory', (addr) => {
      if (addr === null || (addr >= this._begin && addr < this._end)) {
        this.update();
      }
    });

    this.update();
  }

  promptRange() {
    let regex = /^([0-9a-f]{1,4})\s?:\s?([0-9a-f]{1,4})$/i;
    let value = ('000' + this._begin.toString(16)).substr(-4) + ':' + ('000' + (this._end - 1).toString(16)).substr(-4);
    value = prompt('New memory range:', value);
    while (true) {
      if (!value) {
        return;
      } else {
        let matches = value.match(regex);
        if (matches) {
          let b = parseInt(matches[1], 16);
          let e = parseInt(matches[2], 16);
          if (e >= b) {
            this._begin = b;
            this._end = e + 1;
            this.update();
            return;
          }
        }
      }
      value = prompt('Invalid range. New memory range:', value);
    }
  }

  update() {
    let mem_view = this._simulator._ram._memoryView;
    let arr = [];
    for (let i = this._begin, l = this._end; i < l;) {
      let line = '';
      let ascii = '';
      line += ('000' + i.toString(16)).substr(-4) + ' : ';
      for (let j = 0; j < 8 && i < l; j++, i++) {
        let v = mem_view.getInt16(i * 2, true) & 0xffff;
        line += ('000' + v.toString(16)).substr(-4) + ' ';
        if (v > 32 && v < 127) {
          // only printable characters
          ascii += String.fromCharCode(v);
        } else {
          ascii += '.';
        }
      }
      line += ascii + '\n';
      arr.push(line);
    }
    this._$area.val(arr.join(''));
  }
}
