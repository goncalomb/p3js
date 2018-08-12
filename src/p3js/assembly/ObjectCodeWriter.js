import { RAM } from '../devices/RAM.js';

export class ObjectCodeWriter {
  constructor(result) {
    this._result = result;
    this._view = new DataView(this._result.buffer);
    this._position = 0;
  }

  getPosition() {
    if (this._position >= RAM.MEMORY_SIZE) {
      throw "Internal Error: invalid memory position"
    }
    return this._position;
  }

  setPosition(pos) {
    if (pos >= RAM.MEMORY_SIZE) {
      throw "Internal Error: invalid memory position"
    }
    this._position = pos;
  }

  movePosition(off) {
    this._position += off;
  }

  write(value, t) {
    if (this._position >= RAM.MEMORY_SIZE) {
      throw "Assembling Error: end of memory reached"
    }
    if (this._result.usedAddresses[this._position]) {
      throw "Assembling Error: overlapping memory"
    }
    this._view.setInt16(this._position * 2, value, true);
    this._result.usedAddresses[this._position] = (t || 1);
    this._result.memoryUsage++;
    this._position++;
  }

  writeInstZero(op) {
    op = op & 0x3f; // 6 bits
    this.write(op << 10);
  }

  writeInstConstant(op, c) {
    op = op & 0x3f; // 6 bits
    this.write((op << 10) | (c & 0x3ff));
  }

  writeInstOneC(op, c, m, r, w) {
    op = op & 0x3f; // 6 bits
    c = c & 0x0f; // 4 bits
    m = m & 0x03; // 2 bits
    r = r & 0x0f; // 4 bits
    if (m == 2) {
      r = 0;
    }
    this.write((op << 10) | (c << 6) | (m << 4) | r);
    if (m == 2 || m == 3) {
      this.write(w);
    }
  }

  writeInstOne(op, m, r, w) {
    this.writeInstOneC(op, 0, m, r, w);
  }

  writeInstTwo(op, s, r0, m, r1, w) {
    s = s & 0x01 // 1 bits
    r0 = r0 & 0x07; // 3 bits
    this.writeInstOneC(op, ((s << 3) | r0), m, r1, w);
  }

  writeJumpR(op, d) {
    this.writeJumpRC(op, 0, d);
  }

  writeJumpRC(op, c, d) {
    op = op & 0x3f; // 6 bits
    c = c & 0x0f; // 4 bits
    d = d & 0x3f; // 6 bits
    this.write((op << 10) | (c << 6) | d);
  }
}

ObjectCodeWriter.prototype.writeJump = ObjectCodeWriter.prototype.writeInstOne;
ObjectCodeWriter.prototype.writeJumpC = ObjectCodeWriter.prototype.writeInstOneC;
