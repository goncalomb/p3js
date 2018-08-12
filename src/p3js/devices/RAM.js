export class RAM {
  constructor(sim) {
    this._sim = sim;
    this._memoryBufferFresh = new ArrayBuffer(this.constructor.MEMORY_SIZE * this.constructor.MEMORY_WORD_SIZE);
    this._memoryBuffer = new ArrayBuffer(this.constructor.MEMORY_SIZE * this.constructor.MEMORY_WORD_SIZE);
    this._memoryView = new DataView(this._memoryBuffer);
    this.reset();
  }

  reset() {
    (new Uint8Array(this._memoryBuffer)).set(new Uint8Array(this._memoryBufferFresh));
  }

  readFromAddress(addr, iak) {
    return this._memoryView.getInt16(addr*2, true);
  }

  writeToAddress(addr, val) {
    this._memoryView.setInt16(addr*2, val, true);
    this._sim._fireEvent('memory', [addr]);
    return true;
  }

  load(buffer) {
    (new Uint8Array(this._memoryBufferFresh)).set(new Uint8Array(buffer));
  }
}

RAM.MEMORY_SIZE = (1 << 16);
RAM.MEMORY_WORD_SIZE = 2;
