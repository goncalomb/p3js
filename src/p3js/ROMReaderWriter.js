export class ROMReaderWriter {
  constructor(simulator, n) {
    this._simulator = simulator;
    this.c = String.fromCharCode(65 + n);
    this.size = p3js.devices.CPU["ROM_" + this.c + "_SIZE"];
    this.wordLength = p3js.devices.CPU["ROM_" + this.c + "_WORD_LENGTH"];
  }

  static _parseROMValues(text, k_limit, v_limit) {
    let values = [];
    let regex = /^0*([0-9a-f]{1,16})\s+0*([0-9a-f]{1,16})(?:\s*#|$)/i;
    let lines = text.split("\n");
    for (let i = 0, l = lines.length; i < l; i++) {
      let line = lines[i].trim();
      if (line.length == 0 || line[0] == "#") continue;
      let matches = line.match(regex);
      if (matches) {
        let k = parseInt(matches[1], 16);
        if (k < 0 || k > k_limit) {
          throw "Invalid index " + matches[1] + " expecting 0 to " + k_limit.toString(16) + " (hex), on line " + (i + 1);
        }
        if (values[k] !== undefined) {
          throw "Duplicate index " + matches[1] + ", on line " + (i + 1);
        }
        let v = parseInt(matches[2], 16);
        if (v < 0 || v > v_limit) {
          throw "Invalid value " + matches[2] + " expecting 0 to " + v_limit.toString(16) + " (hex), on line " + (i + 1);
        }
        values[k] = v;
      } else {
        throw "Syntax error, on line " + (i + 1);
      }
    }
    return values;
  }

  static _dumpROMValues(data, pad_value) {
    let pad_key = Math.ceil(Math.log2(data.length)/4);
    let str = [];
    let zeros = Array(11).join("0");
    for (let i = 0, l = data.length; i < l; i++) {
      str.push((zeros + i.toString(16)).substr(-pad_key) + " " + (zeros + data[i].toString(16)).substr(-pad_value));
    }
    return str.join("\n");
  }

  dumpROMContents() {
    return this.constructor._dumpROMValues(this._simulator._cpu["_rom" + this.c], Math.ceil(this.wordLength/4));
  }

  overwriteROMContents(string) {
    let new_values = this.constructor._parseROMValues(string, this.size - 1, Math.pow(2, this.wordLength) - 1);
    this._simulator.stop();
    this._simulator._cpu["resetRom" + this.c]();
    let data = this._simulator._cpu["_rom" + this.c];
    Object.keys(new_values).forEach((k) => {
      data[k] = new_values[k];
    });
  }
}
