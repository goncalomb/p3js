export class DebugPanel {
  constructor(simulator, $textarea0, $textarea1) {
    this._simulator = simulator;
    this._$textarea0 = $textarea0;
    this._$textarea1 = $textarea1;
    this._showCtrl = false;

    this._simulator.registerEventHandler("clock", () => {
      this.update();
    });
    this._simulator.registerEventHandler("reset", () => {
      this.update();
    });

    this.update();
  }

  showCtrl(v) {
    this._showCtrl = !!v;
    this.update();
  }

  update() {
    let cpu = this._simulator._cpu;
    function hex(n) {
      return ("000" + (n & 0xffff).toString(16)).substr(-4);
    }
    let text = [];
    for (let i = 0; i < 8; i++) {
      text.push("R" + i + ":  " + hex(cpu._registers[i]));
    }
    text.push("", "SP:  " + hex(cpu._registers[14]));
    text.push("PC:  " + hex(cpu._registers[15]));
    text.push("", "Flags:", "E Z C N O");
    text.push(("000000" + (cpu._re & 0x1f).toString(2)).substr(-5).split("").join(" "));
    this._$textarea0.val(text.join("\n"));
    if (this._showCtrl) {
      let text = [];
      for (let i = 8; i < 16; i++) {
        text.push("R" + i + ": " + (i < 10 ? " " : "") + hex(cpu._registers[i]));
      }
      text.push("", "CAR: " + hex(cpu._car));
      text.push("SBR: " + hex(cpu._sbr));
      text.push("RI:  " + hex(cpu._ri));
      text.push("", "INT: " + cpu._int);
      text.push("z: " + (cpu._re >> 6 & 0x1) + " c: " + (cpu._re >> 5 & 0x1));
      this._$textarea1.val(text.join("\n"));
    }
  }
}
