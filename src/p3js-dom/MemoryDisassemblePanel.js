export class MemoryDisassemblePanel {
  constructor(simulator, element) {
    this._simulator = simulator;
    this._disassembler = new p3js.assembly.Disassembler(simulator);
    this._begin = 0x0000;
    this._end = 0x00ff;
    this._codeMirror = CodeMirror(element, {
      readOnly: true,
      gutters: ['p3js-dom-breakpoint-gutter', 'p3js-dom-address-gutter'],
    });
    this._codeMirror.on('gutterClick', (cm, n) => {
      let info = cm.lineInfo(n);
      let marked = info.gutterMarkers && info.gutterMarkers['p3js-dom-breakpoint-gutter'];
      cm.setGutterMarker(n, 'p3js-dom-breakpoint-gutter', marked ? null : this.constructor.createBreakpointMarker());
    });
  }

  static createBreakpointMarker() {
    let marker = document.createElement('div');
    marker.style.color = '#d22';
    marker.style.paddingLeft = '2px';
    marker.innerText = '●';
    return marker;
  }

  static createAddressMarker(addr) {
    let marker = document.createElement('div');
    marker.style.color = '#999';
    marker.innerText = addr.toString(16).padStart(4, '0');
    return marker;
  }

  setRange(begin, end) {
    begin &= 0xffff;
    end &= 0xffff;
    if (end > begin) {
      this._begin = begin;
      this._end = end;
    }
  }

  getRange() {
    return [this._begin, this._end];
  }

  update() {
    let result = this._disassembler.disassembleMemoryArea(this._begin, this._end - this._begin + 1);
    result = result.filter(v => !!v.inst);
    this._codeMirror.operation(() => {
      this._codeMirror.setValue(result.map(v => v.inst).join('\n'));
      result.forEach((v, i) => {
        this._codeMirror.setGutterMarker(i, 'p3js-dom-address-gutter', this.constructor.createAddressMarker(v.addr));
      });
    });
    setTimeout(() => {
      this._codeMirror.refresh();
    }, 10);
  }
}
