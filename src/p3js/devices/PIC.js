export class PIC {
  constructor(cpu) {
    this._cpu = cpu;
    this.reset();
  }

  reset() {
    this._intPending = Array.apply(null, Array(this.constructor.INTERRUPT_COUNT)).map(Boolean.prototype.valueOf, false);
    this._intMask = 0;
  }

  readFromAddress(addr, iak) {
    if (iak) {
      let int_number = null;
      this._cpu.setIntSignal(0);
      for (let i = 0; i < this.constructor.INTERRUPT_COUNT; i++) {
        if (this._intPending[i] && (i >= 16 || this._intMask >> i & 0x1)) {
          if (int_number === null) {
            this._intPending[i] = false;
            int_number = i;
          } else {
            // more interruptions waiting
            this._cpu.setIntSignal(1);
            break;
          }
        }
      }
      if (int_number === null) {
        // this should never fire
        throw 'PIC error, no interruption pending';
      }
      return int_number;
    } else if (addr == this.constructor.INTERRUPT_MASK_ADDRESS) {
      return this._intMask << 16 >> 16;
    }
  }

  writeToAddress(addr, val) {
    if (addr == this.constructor.INTERRUPT_MASK_ADDRESS) {
      this._intMask = val & 0xffff;
      for (let i = 0; i < this.constructor.INTERRUPT_COUNT; i++) {
        if (this._intPending[i] && (i >= 16 || this._intMask >> i & 0x1)) {
          this._cpu.setIntSignal(1);
          return true;
        }
      }
      this._cpu.setIntSignal(0);
      return true;
    }
  }

  triggerInterrupt(i) {
    if (i >= 0 && i < this.constructor.INTERRUPT_COUNT) {
      this._intPending[i] = true;
      if (i >= 16 || this._intMask >> i & 0x1) {
        this._cpu.setIntSignal(1);
      }
    }
  }
}

PIC.INTERRUPT_COUNT = 256;
PIC.INTERRUPT_MASK_ADDRESS = 0xfffa;
