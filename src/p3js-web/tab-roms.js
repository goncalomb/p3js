export default function(p3sim) {
  ["A", "B", "C"].forEach((c, i) => {
    let $wrapper = $("#rom-" + c.toLowerCase() + "-wrapper");
    $wrapper.append($("<h3>").text("ROM " + c));
    let $btn_apply = $("<button class=\"btn btn-link btn-xs pull-right\">").text("Apply to ROM " + c);
    $wrapper.append($("<h4>").text("Changes ").append($btn_apply));
    let $changes = $("<textarea>").attr({
      rows: 10,
      placeholder: "Put changes to ROM " + c + " here!\n<index hex> <value hex>\n...",
    }).appendTo($wrapper);
    $wrapper.append($("<h4>").text("Contents "));
    let $contents = $("<textarea readonly>").appendTo($wrapper);

    let re = new p3js.dom.ROMEditor(p3sim, i, $contents, $changes);
    $contents.attr("rows", (re._rw.size > 32 ? 32 : re._rw.size));

    $btn_apply.click(() => {
      re.save();
    });
  });
}
