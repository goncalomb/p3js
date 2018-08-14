import * as p3js_web from './';

export default function(p3sim) {
  let $prog_mem_info = $("#prog-mem-info");
  let $prog_memory_footprint = $("#prog-memory-footprint");
  let $prog_label_info = $("#prog-label-info");
  let $prog_labels = $("#prog-labels");

  let mfc = new p3js.dom.MemoryFootprintChart($prog_memory_footprint[0]);

  p3js_web.clearProgramInfo = function() {
    $prog_mem_info.text("");
    $prog_label_info.text("");
    mfc.clear();
    $prog_labels.html("<em>Assemble a program first.</em>\n");
  };

  p3js_web.buildProgramInfo = function(data) {
    $prog_mem_info.text(data.getMemoryUsageString() + " used");
    mfc.displayData(data);
    $prog_label_info.text(data.labelCount);
    let references = [];
    Object.keys(data.labels).forEach((label) => {
      let l = label + " ";
      if (l.length < 24) {
        l += Array(24 - l.length + 1).join(" ");
      }
      let v = data.labels[label].toString(16);
      if (v.length < 4) {
        v = Array(4 - v.length + 1).join("0") + v;
      }
      references.push(l + v + "\n");
    });
    $prog_labels.text(references.join(""));
  };
  p3js_web.clearProgramInfo();
}
