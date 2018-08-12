import * as p3js from '../';
import { RAM } from '../devices/RAM.js';

export class AssemblerResult {
  constructor() {
    this.buffer = new ArrayBuffer(RAM.MEMORY_SIZE * RAM.MEMORY_WORD_SIZE);
    this.usedAddresses = Array.apply(null, Array(RAM.MEMORY_SIZE)).map(Number.prototype.valueOf, 0);
    this.memoryUsage = 0;
    this.labels = { };
    this.labelCount = 0;
    this.pseudoCount = 0;
    this.instructionCount = 0;
  }

  getMemoryUsagePercentage() {
    return Math.floor(this.memoryUsage*10000/RAM.MEMORY_SIZE)/100;
  }

  getMemoryUsageString() {
    return this.memoryUsage + "/" + RAM.MEMORY_SIZE + " (" + this.getMemoryUsagePercentage() + "%)";
  }

  buildProgramCode(oldFormat) {
    return p3js.program.writeProgram(this.buffer, oldFormat, this.usedAddresses);
  }
}
