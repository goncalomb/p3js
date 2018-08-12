export class Terminal {
  constructor(simulator) {
    this._simulator = simulator;
    this._onClear = null;
    this._onTextChange = null;
    this._buffer = [];
    this._cursorMode = false;
    this._lastKey = 0;
    this._x = 0;
    this._y = 0;
  }

  static _charFromCode(code) {
    if (code < 0x20 || (code >= 0x7f && code <= 0xa0) || code == 0xad || code > 0xff) {
      return this.REPLACEMENT_CHAR;
    } else {
      return String.fromCharCode(code);
    }
  }

  _control(v) {
    if (v == 0xffff) {
      this._cursorMode = true;
      this._x = 0;
      this._y = 0;
      var empty_line = Array(80 + 1).join(" ");
      this._buffer = Array.apply(null, new Array(24)).map(function () { return empty_line; });
      if (this._onClear) this._onClear(this._buffer, this._cursorMode);
    } else {
      this._x = v & 0xff;
      this._y = v >> 8 & 0xff;
    }
  }

  _write(v) {
    if (!this._cursorMode) {
      if (this._buffer.length == 0) {
        this._buffer.push("");
      }
      var lf = false;
      var val = this._buffer[this._buffer.length - 1];
      if (v == 10) { // LF
        this._buffer.push("");
        lf = true;
      } else if (val.length >= 80) {
        val = this.constructor._charFromCode(v);
        this._buffer.push(val);
        lf = true;
      } else {
        val += this.constructor._charFromCode(v);
        this._buffer[this._buffer.length - 1] = val;
      }
      if (this._buffer.length > 64) {
        this._buffer.shift();
      }
      if (this._onTextChange) this._onTextChange(this._buffer, this._cursorMode, -1, -1, 0, "\u0000", lf);
    } else if (this._x < 80 && this._y < 24) {
      var c = this.constructor._charFromCode(v);
      var val = this._buffer[this._y];
      val = val.substr(0, this._x) + c + val.substr(this._x + 1, val.length);
      this._buffer[this._y] = val;
      if (this._onTextChange) this._onTextChange(this._buffer, this._cursorMode, this._x, this._y, v, c, false);
    }
  }

  bindHandlers(addrControl, addrState, addrWrite, addrRead) {
    this._simulator._ioc.registerWriteHandler(addrControl || 0xfffc, (value) => {
      this._control(value);
    });
    this._simulator._ioc.registerReadHandler(addrState || 0xfffd, () => {
      return (this._lastKey ? 1 : 0);
    });
    this._simulator._ioc.registerWriteHandler(addrWrite || 0xfffe, (value) => {
      this._write(value);
    });
    this._simulator._ioc.registerReadHandler(addrRead || 0xffff, () => {
      var k = this._lastKey;
      this._lastKey = 0;
      return k;
    });
  }

  sendKey(key) {
    this._lastKey = key;
  }

  onClear(fn) {
    this._onClear = fn;
  }

  onTextChange(fn) {
    this._onTextChange = fn;
  }

  reset() {
    this._buffer = [];
    this._cursorMode = false;
    this._lastKey = 0;
    this._x = 0;
    this._y = 0;
    if (this._onClear) this._onClear(this._buffer, this._cursorMode);
  }
}

Terminal.BUFFER_SIZE = 64 * 80;
Terminal.REPLACEMENT_CHAR = String.fromCharCode(0xfffd);
