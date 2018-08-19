export class LCD {
  constructor(simulator) {
    this._simulator = simulator;
    this._onStateChange = null;
    this._onTextChange = null;
    this._active = true;
    this._x = 0;
    this._y = 0;
    this._text = null;
  }

  _control(v) {
    if ((v & 0x20) !== 0) {
      this._text = null;
      if (this._onStateChange) this._onStateChange(this._text, this._active);
    }
    if ((v & 0x8000) === 0) {
      if (this._active) {
        this._active = false;
        if (this._onStateChange) this._onStateChange(this._text, this._active);
      }
    } else if (!this._active) {
      this._active = true;
      if (this._onStateChange) this._onStateChange(this._text, this._active);
    }
    this._x = v & 0xf;
    this._y = v >> 4 & 0x1;
  }

  _write(v) {
    if (!this._text) {
      this._text = [
        Array(16 + 1).join(' '),
        Array(16 + 1).join(' '),
      ];
    }
    let str = this._text[this._y];
    str = str.substr(0, this._x) + String.fromCharCode(v) + str.substr(this._x + 1, str.length);
    this._text[this._y] = str;
    if (this._active) {
      if (this._onTextChange) this._onTextChange(this._text, this._active, this._x, this._y);
    }
  }

  bindHandlers(addrControl, addrWrite) {
    this._simulator._ioc.registerWriteHandler(addrControl || 0xfff4, (value) => {
      this._control(value);
    });
    this._simulator._ioc.registerWriteHandler(addrWrite || 0xfff5, (value) => {
      this._write(value);
    });
  }

  onStateChange(fn) {
    this._onStateChange = fn;
  }

  onTextChange(fn) {
    this._onTextChange = fn;
  }

  reset() {
    this._active = true;
    this._x = 0;
    this._y = 0;
    this._text = null;
    if (this._onStateChange) this._onStateChange(this._text, this._active);
  }
}
