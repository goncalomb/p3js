import * as blessed from 'blessed';

let program = blessed.program();

export class TerminalUI {
  constructor(p3sim) {
    this._focus = 0;
    this._p3sim = p3sim;
    this._seg7 = p3sim.io.seg7;
    this._lcd = p3sim.io.lcd;
    this._leds = p3sim.io.leds;
    this._switches = p3sim.io.switches;

    program.alternateBuffer();
    process.stdout.write("\x1b[8;30;80t"); // resize
    program.hideCursor();
    program.clear();
    program.on("keypress", (data, k) => {
      if (k.sequence && k.sequence.length > 1) {
        return; // exclude special keys
      }
      let c = (k.sequence || k.ch).charCodeAt(0);
      if (c == 1) { // Ctrl-A
        this.nextFocus();
      } else if (c == 3) { // Ctrl-C
        process.exit();
      } else if (c == 18) { // Ctrl-R
        p3sim.reset();
      } else if (c == 19) { // Ctrl-S
        if (p3sim.isRunning()) {
          p3sim.stop();
        } else {
          p3sim.start();
        }
      } else if (k.ctrl) {
        return; // exclude other special keys
      } else if (this._focus == 1) {
        this.triggerInterrupt(c);
      } else if (this._focus == 2) {
        this.setSwitches(c);
      } else {
        p3sim.io.terminal.sendKey(c);
      }
    });

    this._disposeBound = this.dispose.bind(this);
    process.once("SIGTERM", this._disposeBound);
    process.once("SIGINT", this._disposeBound);
    process.once("exit", this._disposeBound);

    p3sim.registerEventHandler("clock", (c, i, s) => {
      let s_str;
      if (s >= 1000000) {
        s_str = Math.round(s/100000)/10 + " MHz";
      } else if (s >= 1000) {
        s_str = Math.round(s/100)/10 + " kHz";
      } else {
        s_str = Math.round(s*10)/10 + " Hz";
      }
      program.move(32, 1);
      program.eraseInLine("right");
      program.write(s_str);
      program.move(48, 1);
      program.write("c: " + c);
      program.move(64, 1);
      program.write("i: " + i);
    });

    p3sim.io.seg7.onStateChange(this._draw7Seg.bind(this));
    p3sim.io.lcd.onStateChange(this._drawLcd.bind(this));
    p3sim.io.lcd.onTextChange(this._drawLcd.bind(this));
    p3sim.io.leds.onStateChange(this._drawLeds.bind(this));
    p3sim.io.terminal.onClear((buffer, cursorMode) => {
      for (let i = 0; i < 24; i++) {
        program.cursorPos(i + 6, 0);
        program.eraseInLine("right");
      }
    });
    p3sim.io.terminal.onTextChange((buffer, cursorMode, x, y, v, c, lf) => {
      if (cursorMode) {
        // cursor mode, just write the character at the right position
        program.cursorPos(y + 6, x);
        program.write(c);
      } else if (buffer.length < 25 || !lf) {
        // buffer is small or we don't need full repaint (not a line feed)
        // find the last character and write it at the right position
        let val = buffer[buffer.length - 1];
        // check for empty line (line feed with nothing to write)
        if (val.length) {
          program.cursorPos((buffer.length < 24 ? buffer.length - 1 : 23) + 6, val.length - 1);
          program.write(val.substr(-1));
        }
      } else {
        // buffer is big (more than 24 lines) and line feed
        // we need to repaint the screen (scroll one line)
        for (let i = 0, j = buffer.length - 24; i < 24; i++, j++) {
          program.cursorPos(i + 6, 0);
          program.eraseInLine("right");
          program.write(buffer[j]);
        }
      }
    });

    this._drawHeader();
  }

  static keyHexToInt(c) {
    if (c >= 48 && c <= 57) {
      return c - 48;
    } else if (c >= 65 && c <= 70) {
      return c - 65 + 10;
    } else if (c >= 97 && c <= 102) {
      return c - 97 + 10;
    }
    return -1;
  }

  _drawInputs() {
    program.move(56, 3);
    if (this._focus == 1) { program.bg("blue"); }
    program.write("INT");
    if (this._focus == 1) { program.bg("!blue"); }
    program.write(": 0123456789ABCDE");
    program.move(56, 4);
    if (this._focus == 2) { program.bg("blue"); }
    program.write("SWT");
    if (this._focus == 2) { program.bg("!blue"); }
    let swt_str = ("00000000" + this._switches._value.toString(2)).substr(-8);
    program.write(": " + swt_str.substr(0, 4) + " " + swt_str.substr(4));
    program.move(72, 4);
    if (this._focus == 0) { program.bg("blue"); }
    program.write("TERM");
    if (this._focus == 0) { program.bg("!blue"); }
  }

  _draw7Seg() {
    program.move(28, 4);
    program.write("7SEG: " + ("0000" + this._seg7._value.toString(16)).substr(-4));
  }

  _drawLcd() {
    program.move(9, 3);
    program.bg("green");
    if (this._lcd._active && this._lcd._text) {
      program.write(program.text(this._lcd._text[0], "bold"));
    } else {
      program.write("                ");
    }
    program.move(9, 4);
    if (this._lcd._active && this._lcd._text) {
      program.write(program.text(this._lcd._text[1], "bold"));
    } else {
      program.write("                ");
    }
    program.bg("!green");
  }

  _drawLeds() {
    program.move(28, 3);
    let leds_str = ("0000000000000000" + this._leds._value.toString(2)).substr(-16);
    program.write("LEDS: " + leds_str.substr(0, 4) + " " + leds_str.substr(4, 4) + " " + leds_str.substr(8, 4) + " " + leds_str.substr(12));
  }

  _drawHeader() {
    let hr = "\u2500".repeat(80);
    for (let i = 0; i < 6; i++) {
      program.move(0, i);
      program.eraseInLine("right");
      if (i == 0 || i == 2 || i == 5) {
        program.write(hr);
      }
    }
    function put_char(x, y, c) {
      program.move(x, y);
      program.write(String.fromCharCode(c));
    }
    program.move(1, 1);
    program.write(program.text("P3JS Simulator", "bold"));
    put_char(2, 2, 0x252c);
    put_char(2, 3, 0x2502);
    put_char(2, 4, 0x2502);
    put_char(2, 5, 0x2534);
    program.move(4, 3);
    program.write("LCD:");
    this._drawLcd();
    put_char(26, 2, 0x252c);
    put_char(26, 3, 0x2502);
    put_char(26, 4, 0x2502);
    put_char(26, 5, 0x2534);
    this._drawLeds();
    this._draw7Seg();
    put_char(54, 2, 0x252c);
    put_char(54, 3, 0x2502);
    put_char(54, 4, 0x2502);
    put_char(54, 5, 0x2534);
    this._drawInputs();
    put_char(77, 2, 0x252c);
    put_char(77, 3, 0x2502);
    put_char(77, 4, 0x2502);
    put_char(77, 5, 0x2534);
  }

  nextFocus() {
    this._focus = (this._focus + 1)%3;
    this._drawInputs();
  }

  setSwitches(c) {
    let i = this.constructor.keyHexToInt(c);
    if (i != -1 && i < 8) {
      this._switches.toggle(i);
      let ii = 61 + (i < 4 ? 8 : 7) - i;
      program.move(ii, 4);
      program.bg("red");
      program.write(((this._switches._value >> i) & 1).toString());
      program.bg("!red");
      setTimeout(() => {
        program.move(ii, 4);
        program.write(((this._switches._value >> i) & 1).toString());
      }, 100);
    }
  }

  triggerInterrupt(c) {
    let i = this.constructor.keyHexToInt(c);
    if (i != -1) {
      this._p3sim.interrupt(i);
      program.move(61 + i, 3);
      program.bg("red");
      program.write(String.fromCharCode(c).toUpperCase());
      program.bg("!red");
      setTimeout(() => {
        program.move(61 + i, 3);
        program.write(String.fromCharCode(c).toUpperCase());
      }, 100);
    }
  }

  dispose() {
    process.removeListener("exit", this._disposeBound);
    program.clear();
    program.showCursor();
    program.normalBuffer();
    process.exit();
  }
}
