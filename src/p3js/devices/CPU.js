/* eslint-disable no-multi-spaces, key-spacing */

export class CPU {
  constructor(busDevices) {
    this._busDevices = busDevices;
    this._romA = null;
    this._romB = null;
    this._romC = null;
    this.resetRomA();
    this.resetRomB();
    this.resetRomC();
    this._resetVariables();
  }

  _resetVariables() {
    // registers
    this._registers = [
      0,                   // R0    = 0
      0, 0, 0, 0, 0, 0, 0, // R1-7  general use
      0, 0, 0,             // R8-10 restricted use
      0,                   // R11   = SD (source data)
      0,                   // R12   = EA (effective address)
      0,                   // R13   = RD (result data)
      0,                   // R14   = SP (stack pointer)
      0,                   // R15   = PC (program counter)
    ];
    this._ri = 0;          // RI    (instruction register)
    this._re = 0;          // RE    (status register)
    this._car = 0;         // CAR   (control address register)
    this._sbr = 0;         // SBR   (subroutine branch register)
    // flags
    this._int = 0;         // interrupt flag
    this._iak = 0;         // interrupt acknowledge flag
    // other
    this._cachedMicro = null;
    this._cachedInstruction = null;
    this._clockCount = 0;
    this._instructionCount = 0;
  }

  _unpackIntruction(i) {
    return {
      op:  (i >> 10 & 0x3f),
      s:   (i >>  9 & 0x1),
      ir2: (i >>  6 & 0x7),
      m:   (i >>  4 & 0x3),
      ir1: (i >>  0 & 0xf),
      c:   (i >>  6 & 0xf),
      d:   (i >>  0 & 0x3f),
    };
  }

  _unpackMicro(i) {
    return {
      f:     (i >> 31 & 0x01),
      // f = 0 or 1
      rad:   (i >>  0 & 0xf),
      mad:   (i >>  4 & 0x1),
      md:    (i >>  5 & 0x3),
      wr:    (i >>  7 & 0x1),
      sr2:   (i >> 27 & 0x1),
      sr1:   (i >> 28 & 0x1),
      m5:    (i >> 29 & 0x3),
      // f = 0
      wm:    (i >>  8 & 0x1),
      rb:    (i >>  9 & 0xf),
      mrb:   (i >> 13 & 0x1),
      m2:    (i >> 14 & 0x1),
      mb:    (i >> 15 & 0x1),
      ma:    (i >> 16 & 0x1),
      cula:  (i >> 17 & 0x1f),
      fm:    (i >> 22 & 0xf),
      iak:   (i >> 26 & 0x1),
      // f = 1
      const: (i >>  8 & 0xfff),
      lf:    (i >> 20 & 0x1),
      li:    (i >> 21 & 0x1),
      cc:    (i >> 22 & 0x1),
      mcond: (i >> 23 & 0x7),
      ls:    (i >> 26 & 0x1),
    };
  }

  _fillCache() {
    if (!this._cachedMicro) {
      this._cachedMicro = [];
      let sim = this;
      this._romC.forEach((i) => {
        sim._cachedMicro.push(sim._unpackMicro(i));
      });
    }
    if (!this._cachedInstruction) {
      this._cachedInstruction = this._unpackIntruction(this._ri);
    }
  }

  _readMemory(addr) {
    addr &= 0xffff;
    for (let i = 0, l = this._busDevices.length; i < l; i++) {
      let v = this._busDevices[i].readFromAddress(addr, this._iak);
      if (v !== undefined) {
        return v;
      }
    }
    throw "BUS read error";
  }

  _writeMemory(addr, val) {
    addr &= 0xffff;
    for (let i = 0, l = this._busDevices.length; i < l; i++) {
      if (this._busDevices[i].writeToAddress(addr, val) !== undefined) {
        return;
      }
    }
    throw "BUS write error";
  }

  _alu(a, b, cula, c) {
    // In JavaScript all numbers are double-precision floating point.
    // Bitwise operators convert the numbers to 32 bit integers and then
    // back to floating point.
    // The ALU (and the data bus) use 32 bit signed integers.
    // In some instances 'result = result << 16 >> 16;' is used to replicate
    // the sign bit and fill the upper 16 bits (making a 32 bit signed
    // integer).
    // If the simulator is implemented correctly these exceptions should
    // never fire.
    if (a !== (a & 0xffffffff) || b !== (b & 0xffffffff)) {
      // Integers please.
      throw "ALU error, invalid operand (not integer)";
    }
    let t = (a & 0xffff8000) ^ (b & 0xffff8000);
    if (t != 0 && (t ^ 0xffff8000) != 0) {
      // This basically checks if both operands (a, b) have all the upper
      // 16 bits equal to the 15th bit (sign).
      // Equivalent to checking if they are between -32768 and 32767.
      throw "ALU error, invalid operand (invalid number)";
    }
    cula &= 0x1f;
    c &= 0x1;
    let result = 0;
    let zero = 0;
    let carry = 0;
    let negative = 0;
    let overflow = 0;
    switch (cula) {
      case 4: cula = 1; b = 1; break;
      case 5: cula = 0; b = 1; break;
      case 6:
        b = 1;
        cula = (!c ? 1 : 24);
        break;
      case 7:
        b = 1;
        cula = (c ? 0 : 24);
        break;
    }
    switch (cula) {
      // arithmetic unit
      case 0:
      case 2:
        result = a + b + (cula == 2 && c ? 1 : 0);
        result = result << 16 >> 16;
        if ((a & b & 0x8000) != 0 || ((a ^ b) & ~result & 0x8000) != 0) {
          carry = 1;
        }
        if ((((a ^ b) & 0x8000) == 0) && (((a ^ result) & 0x8000) != 0)) {
          overflow = 1;
        }
        break;
      case 1:
      case 3:
        result = a - b - (cula == 3 && !c ? 1 : 0);
        result = result << 16 >> 16;
        if ((a & ~b & 0x8000) != 0 || (~(a ^ b) & ~result & 0x8000) != 0) {
          carry = 1;
        }
        if ((((a ^ b) & 0x8000) != 0) && (((a ^ result) & 0x8000) != 0)) {
          overflow = 1;
        }
        break;
      // 4, 5, 6, 7 are handled by the previous cases
      // logic unit
      case 8:
      case 12:
        result = ~a;
        break;
      case 9:
      case 13:
        result = a & b;
        break;
      case 10:
      case 14:
        result = a | b;
        break;
      case 11:
      case 15:
        result = a ^ b;
        break;
      // shift unit
      case 16:
        carry = a & 0x1;
        result = (a >> 1) & 0x00007fff; // shift and fill upper 16 bits with zero
        break;
      case 17:
        carry = a >> 15 & 0x1;
        result = a << 1;
        if (carry != (result >> 15 & 0x1)) {
          // sign changed
          result = result << 16 >> 16;
        }
        break;
      case 18:
        carry = a & 0x1;
        result = a >> 1;
        break;
      case 19:
        carry = a >> 15 & 0x1;
        result = a << 1;
        if (carry != (result >> 15 & 0x1)) {
          // sign changed, overflow
          result = result << 16 >> 16;
          overflow = 1;
        }
        break;
      case 20:
        carry = a & 0x1;
        result = (a & 0xffff) >> 1;
        result |= carry << 15;
        result = result << 16 >> 16;
        break;
      case 21:
        carry = a >> 15 & 0x1;
        result = (a << 1) & 0xffff;
        result |= carry;
        result = result << 16 >> 16;
        break;
      case 22:
        carry = a & 0x1;
        result = (a & 0xffff) >> 1;
        result |= c << 15;
        result = result << 16 >> 16;
        break;
      case 23:
        carry = a >> 15 & 0x1;
        result = (a << 1) & 0xffff;
        result |= c;
        result = result << 16 >> 16;
        break;
      // passthrough
      default:
        result = a;
        break;
    }
    if (result == 0) {
      zero = 1;
    } else if ((result & 0x8000) != 0) {
      negative = 1;
    }
    return {
      result,
      zcno: (zero << 3) | (carry << 2) | (negative << 1) | overflow,
    };
  }

  clock() {
    this._fillCache();
    let inst = this._cachedInstruction;
    let micro = this._cachedMicro[this._car];
    // control unit
    if (micro.f && micro.ls) {
      this._sbr = (this._car + 1) & 0xffff;
    }
    if (micro.m5 == 0) {
      let c0 = 0;
      if (micro.f) {
        let c1;
        switch (micro.mcond) {
          case 0: c1 = 1; break;
          case 1: c1 = this._re >> 6 & 0x1; break; // z
          case 2: c1 = this._re >> 5 & 0x1; break; // c
          case 3: c1 = this._re >> 4 & this._int & 0x1; break; // E & INT
          case 4: c1 = inst.m >> 0 & 0x1; break; // M0
          case 5: c1 = inst.m >> 1 & 0x1; break; // M1
          case 6: c1 = (inst.op >> 5) & ~(inst.op >> 4) & inst.s & 0x1; break; // RI15 & ~RI14 & S
          case 7:
            switch (inst.c >> 1) {
              case 0: c1 = this._re >> 3 & 0x1; break; // Z
              case 1: c1 = this._re >> 2 & 0x1; break; // C
              case 2: c1 = this._re >> 1 & 0x1; break; // N
              case 3: c1 = this._re >> 0 & 0x1; break; // O
              case 4: c1 = ~((this._re >> 3) | (this._re >> 1)) & 0x1; break; // P = ~(Z|N)
              case 5: c1 = this._int & 0x1; break; // INT
            }
            c1 ^= (inst.c & 0x1);
            break;
        }
        c0 = c1 ^ micro.cc;
      }
      if (micro.f && c0) {
        this._car = micro.const & 0xffff;
      } else {
        this._car = (this._car + 1) & 0xffff;
      }
    } else if (micro.m5 == 1) {
      this._car = this._sbr;
    } else if (micro.m5 == 2) {
      this._car = this._romA[inst.op];
    } else if (micro.m5 == 3) {
      this._car = this._romB[(micro.sr2 << 3) | ((micro.sr2 ? inst.s : micro.sr1) << 2) | inst.m];
    }
    let sel_b = (micro.mrb ? micro.rb : (micro.m2 ? inst.ir2 : inst.ir1));
    let sel_ad = (micro.mad ? micro.rad : ((micro.m2 ^ inst.s) && (inst.op & 0x20) ? inst.ir2 : inst.ir1));
    // data circuit
    // get operands (MUXA and MUXB)
    let a; let
      b;
    if (!micro.f && micro.ma) {
      a = this._registers[sel_b];
    } else {
      a = this._registers[sel_ad];
    }
    if (micro.mb) {
      b = this._ri;
    } else {
      b = this._registers[sel_b];
    }
    // cumpute result (MUXD)
    let alu = this._alu(a, b, micro.cula, this._re >> 2 & 0x1);
    let result;
    switch (micro.md) {
      case 0: result = alu.result; break;
      case 1: result = this._readMemory(a); break;
      case 2: result = this._re & 0x1f; break;
      case 3: result = micro.const; break;
    }
    // write RE
    // state: z c E Z C N O
    //   bit: 6 5 4 3 2 1 0
    if (micro.f) {
      if (micro.lf) {
        this._re = a & 0x1f;
      }
    } else {
      this._re = (micro.fm & alu.zcno) | (~micro.fm & this._re);
    }
    this._re = this._re & 0x1f | (alu.zcno << 3 & 0x60); // set z and c
    // write memory
    if (!micro.f && micro.wm) {
      this._writeMemory(a, b);
    }
    // write register
    if (micro.wr && sel_ad != 0) {
      this._registers[sel_ad] = result;
    }
    // write RI
    if (micro.f && micro.li) {
      this._ri = this._readMemory(a);
      this._cachedInstruction = this._unpackIntruction(this._ri);
      this._instructionCount++;
    }
    // set iak
    this._iak = (!micro.f && micro.iak ? 1 : 0);
    // finalize
    this._clockCount++;
    return (micro.f && micro.li); // finished an instruction?
  }

  setIntSignal(i) {
    this._int = (i & 0x1);
  }

  reset() {
    for (let i = 0, l = this._busDevices.length; i < l; i++) {
      this._busDevices[i].reset();
    }
    this._resetVariables();
  }

  resetRomA() {
    this._romA = [
      0x0032, 0x0033, 0x0037, 0x003b, 0x003e, 0x0040, 0x0044, 0x0047,
      0x004c, 0x0055,      0,      0,      0,      0,      0,      0,
      0x005b, 0x005e, 0x0060, 0x0062, 0x0064, 0x0067,      0,      0,
      0x006a, 0x0071, 0x0078, 0x007f, 0x008c, 0x0093, 0x009a, 0x00a1,
      0x00c2, 0x00b4, 0x00b6, 0x00b8, 0x00ba, 0x00cf, 0x00dd, 0x00c4,
      0x00bc, 0x00be, 0x00c0, 0x00a8, 0x00af, 0x00aa, 0x00ca,      0,
      0x0102, 0x0105, 0x0109, 0x010d,      0,      0,      0,      0,
      0x00f9, 0x00f8,      0,      0,      0,      0,      0,      0,
      // empty addresses: 10 to 15, 22, 23, 47, 52 to 55, 58 to 63
    ];
  }

  resetRomB() {
    this._romB = [
      0x000a, 0x000b, 0x000d, 0x000f, 0x002d, 0x002f, 0x002d, 0x002f,
      0x0013, 0x0017, 0x001d, 0x0023, 0x0015, 0x001a, 0x0020, 0x0028,
    ];
  }

  resetRomC() {
    this._romC = [
      0x8060001f, 0x400a009f, 0x81c000d8, 0x0008319e,
      0x04083f9e, 0x000000b9, 0x804200f8, 0x00023099,
      0x000132bf, 0x80100010, 0x2031009d, 0x0031009c,
      0x200138bd, 0x00013ebd, 0x200a009f, 0x00013ebc,
      0x000a009f, 0x0000009c, 0x200138bd, 0x0031009d,
      0x2031409b, 0x0031009b, 0x2031409d, 0x0031009c,
      0x000138bd, 0x2031409b, 0x0031009c, 0x000138bb,
      0x2031409d, 0x00013ebd, 0x000a009f, 0x2031409b,
      0x00013ebb, 0x000a009f, 0x2031409d, 0x00013ebc,
      0x000a009f, 0x0000009c, 0x000138bd, 0x2031409b,
      0x00013ebc, 0x000a009f, 0x0000009c, 0x000138bb,
      0x2031409d, 0x00313a80, 0x80000200, 0x83002d00,
      0x00003b1c, 0x80000200, 0x80000200, 0x804010f8,
      0x000000d9, 0x00143298, 0x80100218, 0x80400ff8,
      0x000000d9, 0x00123298, 0x80100218, 0x00112098,
      0x010a0018, 0x80000200, 0x01002010, 0x80000200,
      0x804004f8, 0x000000d9, 0x00163298, 0x80100218,
      0x000a009e, 0x00013cbf, 0x80000200, 0x000a009e,
      0x00013cbf, 0x000a009e, 0x00013cb8, 0x80100218,
      0x000000d8, 0x0008319e, 0x00083f9e, 0x8040fff8,
      0x00128098, 0x804200f9, 0x00023298, 0x000130bf,
      0x80100010, 0x000a009e, 0x00013cbf, 0x8043fff8,
      0x00128098, 0x0000309e, 0x80000200, 0xe40000f8,
      0x03c23a98, 0x7031309d, 0xe4000000, 0x73ca009d,
      0xe4000000, 0x73c8009d, 0xe4000000, 0x7290009d,
      0xe4000000, 0x00083b9e, 0x80000200, 0xe4000000,
      0x000a009e, 0x70013cbd, 0xe403c0f8, 0x00128098,
      0x804040f9, 0x03a0009d, 0x00023298, 0x80c06d00,
      0x70000000, 0xe403c0f8, 0x00128098, 0x804040f9,
      0x03a2009d, 0x00023298, 0x80c07400, 0x70000000,
      0xe403c0f8, 0x00128098, 0x804040f9, 0x03e4009d,
      0x00023298, 0x80c07b00, 0x70000000, 0xe403c0f8,
      0x00128098, 0x0031209a, 0x03e6009d, 0x000000d9,
      0x0014329a, 0x804040f9, 0x00023298, 0x80c082d9,
      0x804001f8, 0x0012309a, 0x0014329a, 0xf010001a,
      0xe403c0f8, 0x00128098, 0x804040f9, 0x03a8009d,
      0x00023298, 0x80c08f00, 0x70000000, 0xe403c0f8,
      0x00128098, 0x804040f9, 0x03aa009d, 0x00023298,
      0x80c09600, 0x70000000, 0xe403c0f8, 0x00128098,
      0x804040f9, 0x03ac009d, 0x00023298, 0x80c09d00,
      0x70000000, 0xe403c0f8, 0x00128098, 0x804040f9,
      0x03ae009d, 0x00023298, 0x80c0a400, 0x70000000,
      0xec000000, 0x7031369d, 0xec00fff8, 0x00113099,
      0x0012329d, 0x00123698, 0x7014309d, 0xec00fff8,
      0x00113099, 0x0012309d, 0x00123699, 0x7014329d,
      0xec000000, 0x73c0369d, 0xec000000, 0x73c4369d,
      0xec000000, 0x73c2369d, 0xec000000, 0x73c6369d,
      0xec000000, 0x7292369d, 0xec000000, 0x7294369d,
      0xec000000, 0x7296369d, 0xec000000, 0x73c2361d,
      0xec000000, 0x7292361d, 0x8340c900, 0x8240c900,
      0x7000371c, 0x70317680, 0xec000000, 0x00313a98,
      0x0031369d, 0x0031309b, 0x8000c600, 0xec0010f8,
      0x000000da, 0x0012309a, 0x00313a99, 0x01f1209d,
      0x002c009b, 0x8150d71a, 0x0100329d, 0x012c009d,
      0x00080098, 0x80c0d400, 0x012c009b, 0x0200361d,
      0x8000c600, 0xec0000d8, 0x0000201b, 0x80c0e300,
      0x804001f9, 0x00143298, 0x80100218, 0x01c12099,
      0x0002361d, 0x8140f500, 0x00312098, 0x000a0098,
      0x0122009b, 0x8100ec00, 0x0002361d, 0x8100e700,
      0x002c009b, 0x0102369d, 0x8100f100, 0x0000369d,
      0x01300010, 0x002e0099, 0x0020009b, 0x00080098,
      0x80c0ed00, 0x00313a9b, 0x0331329d, 0x8000c600,
      0x83c00200, 0x80403ff8, 0x0013b099, 0x804020fa,
      0x0012329a, 0x80810000, 0x00100098, 0x00143099,
      0x0000329f, 0x80000200, 0xe4000000, 0x00313a9f,
      0x80000200, 0xe4000000, 0x83c00200, 0x00313a9f,
      0x80000200, 0xe4000000, 0x00083f9e, 0x00313a9f,
      0x80000200, 0xe4000000, 0x83c00200, 0x00083f9e,
      0x00313a9f, 0x80000200,
      // empty from 274 to 511
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
  }
}

CPU.INTERRUPT_VECTOR_ADDRESS = 0xfe00; // can be changed on ROM C
CPU.ROM_A_SIZE = (1 << 6);   // 64 positions
CPU.ROM_A_WORD_LENGTH = 9;   // 9 bits
CPU.ROM_B_SIZE = (1 << 4);   // 16 positions
CPU.ROM_B_WORD_LENGTH = 9;   // 9 bits
CPU.ROM_C_SIZE = (1 << 9);   // 512 positions
CPU.ROM_C_WORD_LENGTH = 32;  // 32 bits
