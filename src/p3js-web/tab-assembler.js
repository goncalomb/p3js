import * as p3js_web from './';

export default function(p3sim) {
  let $asm_editor_files = $("#asm-editor-files");
  let $asm_editor_new = $("#asm-editor-new");
  let $asm_editor_save = $("#asm-editor-save");
  let $asm_editor_download = $("#asm-editor-download");
  let $asm_editor_delete = $("#asm-editor-delete");
  let $asm_editor_demos = $("#asm-editor-demos");

  let $assemble = $("#assemble");
  let $assemble_run = $("#assemble-run");
  let $assemble_dl = $("#assemble-dl");
  let $asm_info = $("#asm-info");

  function asm_info_add(message, cssClass) {
    if (message) {
      let $li = $("<li>").text(message).appendTo($asm_info);
      if (cssClass) {
        $li.attr("class", cssClass);
      }
    } else {
      $asm_info.html("");
    }
  }

  // linter
  let use_linter = true;
  CodeMirror.registerHelper("lint", null, (text) => {
    if (use_linter) {
      asm_info_add(null);
      try {
        p3js.assembly.assembleWithDefaultValidator(text);
        asm_info_add("No errors.");
      } catch (e) {
        if (e instanceof p3js.assembly.AssemblerError && e.line !== null) {
          asm_info_add(e.getFullMessage(), "text-danger");
          return [{
            from: CodeMirror.Pos(e.line - 1, 0),
            to: CodeMirror.Pos(e.line - 1, 80),
            message: e.message,
          }];
        }
      }
    }
    return [];
  });

  // editor
  let editor = new p3js.dom.AssemblyEditor(
    $("#code-editor"),
    $asm_editor_files,
    $asm_editor_demos,
  );

  let $code_mirror = $(editor.codeMirror.getWrapperElement());
  $(document).on("fullscreenon", () => {
    $code_mirror.height($(window).height() - $code_mirror.offset().top - 20);
  }).on("fullscreenoff", () => {
    $code_mirror.css("height", "");
  }).on("p3js-tab-change", (e, tab) => {
    if (tab == "assembler") {
      setTimeout(() => {
        if ($(document.body).hasClass("fullscreen")) {
          $code_mirror.height($(window).height() - $code_mirror.offset().top - 20);
        }
        editor.codeMirror.refresh();
      });
    }
  });

  $asm_editor_new.click(() => { editor.new(); });
  $asm_editor_save.click(() => { editor.save(); });
  $asm_editor_delete.click(() => { editor.delete(); });

  editor.onFileChange((currentFile, currentFileIsDemo) => {
    $asm_editor_delete.attr("disabled", !(currentFile && !currentFileIsDemo));
  });

  editor.loadFiles([
    "welcome.as",
    {
      label: "P3JS Demos",
      files: [
        "automaton.as",
        "keyboard-test.as",
        "logo.as",
        "template.as",
      ],
    },
    {
      label: "IST Demos",
      files: ["Demo1-clean.as"],
    },
  ]);

  $asm_editor_download.click(() => {
    let code = editor.getValue();
    if (code) {
      p3js_web.downloadBuffer(code, editor.getFileName());
    }
  });

  // assembler

  let is_assembling = false;

  function assemble_program(callback) {
    if (!is_assembling) {
      is_assembling = true;
      asm_info_add(null);
      asm_info_add("Assembling...");
      setTimeout(() => {
        let t = Date.now();
        try {
          let result = p3js.assembly.assembleWithDefaultValidator(editor.getValue());
          asm_info_add(null);
          asm_info_add("Assembling finished (" + (Date.now() - t) + " ms).", "text-success");
          asm_info_add("Program loaded on simulator.", "text-info small");
          p3js_web.buildProgramInfo(result);
          p3sim.loadMemory(result.buffer);
          if (callback) {
            callback(result);
          }
        } catch (e) {
          p3js_web.clearProgramInfo();
          asm_info_add(null);
          if (e instanceof p3js.assembly.AssemblerError) {
            asm_info_add(e.getFullMessage(), "text-danger");
          } else {
            asm_info_add("Something is not right (" + e.toString() + ").", "text-danger");
            asm_info_add("Please contact me so I can look into it. Thanks.", "text-info small");
            console.error(e);
          }
        }
        is_assembling = false;
      });
    }
  }

  $assemble.click(() => {
    assemble_program();
  });

  $assemble_run.click(() => {
    assemble_program((result) => {
      p3sim.start();
      window.location.hash = "#simulator";
    });
  });

  $assemble_dl.click(() => {
    assemble_program((result) => {
      p3js_web.downloadBuffer(result.buildProgramCode(), editor.getFileName("exe"));
      asm_info_add("Download requested (p3as format).", "text-info small");
    });
  });

  $("#asm-use-linter").change((e) => {
    use_linter = e.currentTarget.checked;
  });

  $("#asm-show-rulers").change((e) => {
    $code_mirror[e.currentTarget.checked ? "addClass" : "removeClass"]("asm-show-rulers");
  });

  $("#asm-show-extra-rulers").change((e) => {
    $code_mirror[e.currentTarget.checked ? "addClass" : "removeClass"]("asm-show-extra-rulers");
  });

  $code_mirror.addClass("asm-show-rulers");
  asm_info_add(null);
  asm_info_add("Initialized.");
}
