export class IOC {
  constructor() {
    this._readHandlers = { };
    this._writeHandlers = { };
  }

  reset() { }

  readFromAddress(addr, iak) {
    if (addr >= this.constructor.IO_FIRST_ADDRESS && addr <= this.constructor.IO_LAST_ADDRESS) {
      if (this._readHandlers[addr]) {
        return this._readHandlers[addr].call(this) << 16 >> 16;
      }
      return -1;
    }
  }

  writeToAddress(addr, val) {
    if (addr >= this.constructor.IO_FIRST_ADDRESS && addr <= this.constructor.IO_LAST_ADDRESS) {
      if (this._writeHandlers[addr]) {
        this._writeHandlers[addr].call(this, val & 0xffff);
      }
      return true;
    }
  }

  registerReadHandler(addr, fn) {
    if (addr >= this.constructor.IO_FIRST_ADDRESS && addr <= this.constructor.IO_LAST_ADDRESS && typeof fn === 'function') {
      this._readHandlers[addr] = fn;
    }
  }

  registerWriteHandler(addr, fn) {
    if (addr >= this.constructor.IO_FIRST_ADDRESS && addr <= this.constructor.IO_LAST_ADDRESS && typeof fn === 'function') {
      this._writeHandlers[addr] = fn;
    }
  }
}

IOC.IO_FIRST_ADDRESS = 0xff00;
IOC.IO_LAST_ADDRESS = 0xffff;
