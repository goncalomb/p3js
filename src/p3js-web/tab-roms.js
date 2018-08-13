export default function(p3sim) {
  ["A", "B", "C"].forEach(function(c, i) {
    var $wrapper = $("#rom-" + c.toLowerCase() + "-wrapper");
    $wrapper.append($("<h3>").text("ROM " + c));
    var $btn_apply = $("<button class=\"btn btn-link btn-xs pull-right\">").text("Apply to ROM " + c);
    $wrapper.append($("<h4>").text("Changes ").append($btn_apply));
    var $changes = $("<textarea>").attr({
      "rows": 10,
      "placeholder" : "Put changes to ROM " + c + " here!\n<index hex> <value hex>\n..."
    }).appendTo($wrapper);
    $wrapper.append($("<h4>").text("Contents "));
    var $contents = $("<textarea readonly>").appendTo($wrapper);

    var re = new p3js.dom.ROMEditor(p3sim, i, $contents, $changes);
    $contents.attr("rows", (re._rw.size > 32 ? 32 : re._rw.size));

    $btn_apply.click(function() {
      re.save();
    });
  });
};
