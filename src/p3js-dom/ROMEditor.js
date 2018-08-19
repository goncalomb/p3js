export class ROMEditor {
  constructor(simulator, n, $contents, $changes) {
    this._rw = new p3js.ROMReaderWriter(simulator, n);
    this._$contents = $contents;
    this._$changes = $changes;
    this._dump();
  }

  _dump() {
    this._$contents.val(this._rw.dumpROMContents());
  }

  save() {
    try {
      this._rw.overwriteROMContents(this._$changes.val());
    } catch (e) {
      alert(e.message);
      return;
    }
    this._dump();
    alert("Done.");
  }
}
