export class MemoryRangePanel {
  constructor(begin, end) {
    this._begin = begin;
    this._end = end;
  }

  promptRange() {
    let regex = /^([0-9a-f]{1,4})\s?:\s?([0-9a-f]{1,4})$/i;
    let value = this._begin.toString(16).padStart(4, '0') + ':' + this._end.toString(16).padStart(4, '0');
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
            this._end = e;
            this.update();
            if (this._end - this._begin > 0xff) {
              alert('WARNING: Large memory ranges may decrease simulator performance.');
            }
            return;
          }
        }
      }
      value = prompt('Invalid range. New memory range:', value);
    }
  }

  setRange(begin, end) {
    begin &= 0xffff;
    end &= 0xffff;
    if (end > begin) {
      this._begin = begin;
      this._end = end;
    }
  }

  getRange() {
    return [this._begin, this._end];
  }

  update() { }
}
