/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

var p3js_web = require(".");

module.exports = function(p3sim) {

	var $document = $(document);

	var $asm_editor_files = $("#asm-editor-files");
	var $asm_editor_new = $("#asm-editor-new");
	var $asm_editor_save = $("#asm-editor-save");
	var $asm_editor_download = $("#asm-editor-download");
	var $asm_editor_delete = $("#asm-editor-delete");
	var $asm_editor_demos = $("#asm-editor-demos");

	var $assemble = $("#assemble");
	var $assemble_run = $("#assemble-run");
	var $assemble_dl = $("#assemble-dl");
	var $asm_info = $("#asm-info");

	function asm_info_add(message, cssClass) {
		if (message) {
			var $li = $("<li>").text(message).appendTo($asm_info);
			if (cssClass) {
				$li.attr("class", cssClass);
			}
		} else {
			$asm_info.html("");
		}
	}

	// linter
	var use_linter = true;
	CodeMirror.registerHelper("lint", null, function(text) {
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
						message: e.message
					}];
				}
			}
		}
		return [];
	});

	// editor
	var editor = new p3js.dom.AssemblyEditor(
		$("#code-editor"),
		$asm_editor_files,
		$asm_editor_demos
	);

	var $code_mirror = $(editor.codeMirror.getWrapperElement());
	$document.on("fullscreenon", function() {
		$code_mirror.height($(window).height() - $code_mirror.offset().top - 20);
	}).on("fullscreenoff", function() {
		$code_mirror.css("height", "");
	}).on("p3js-tab-change", function(e, tab) {
		if (tab == "assembler") {
			setTimeout(function() {
				if ($(document.body).hasClass("fullscreen")) {
					$code_mirror.height($(window).height() - $code_mirror.offset().top - 20);
				}
				editor.codeMirror.refresh();
			});
		}
	});

	$asm_editor_new.click(function() { editor.new(); });
	$asm_editor_save.click(function() { editor.save(); });
	$asm_editor_delete.click(function() { editor.delete(); });

	editor.onFileChange(function(currentFile, currentFileIsDemo) {
		$asm_editor_delete.attr("disabled", !(currentFile && !currentFileIsDemo));
	});

	editor.loadFiles([
		"welcome.as",
		{
			label: "P3JS Demos",
			files: [
				"automaton.as",
				"keyboard-test.as",
				"template.as"
			]
		},
		{
			label: "IST Demos",
			files: [ "Demo1-clean.as" ]
		}
	]);

	$asm_editor_download.click(function() {
		var code = editor.getValue();
		if (code) {
			p3js_web.downloadBuffer(code, editor.getFileName());
		}
	});

	// assembler

	var is_assembling = false;

	function assemble_program(callback) {
		if (!is_assembling) {
			is_assembling = true;
			asm_info_add(null)
			asm_info_add("Assembling...");
			setTimeout(function() {
				var t = Date.now();
				try {
					var result = p3js.assembly.assembleWithDefaultValidator(editor.getValue());
					asm_info_add(null)
					asm_info_add("Assembling finished (" + (Date.now() - t) + " ms).", "text-success");
					asm_info_add("Program loaded on simulator.", "text-info small");
					p3js_web.buildProgramInfo(result);
					p3sim.loadMemory(result.buffer);
					if (callback) {
						callback(result);
					}
				} catch (e) {
					p3js_web.clearProgramInfo();
					asm_info_add(null)
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

	$assemble.click(function() {
		assemble_program();
	});

	$assemble_run.click(function() {
		assemble_program(function(result) {
			p3sim.start();
			window.location.hash = "#simulator";
		});
	});

	$assemble_dl.click(function() {
		assemble_program(function(result) {
			p3js_web.downloadBuffer(result.buildProgramCode(), editor.getFileName("exe"));
			asm_info_add("Download requested (p3as format).", "text-info small");
		});
	});

	$("#asm-use-linter").change(function() {
		use_linter = this.checked;
	});

	$("#asm-show-rulers").change(function() {
		$code_mirror[this.checked ? "addClass" : "removeClass"]("asm-show-rulers");
	});

	$("#asm-show-extra-rulers").change(function() {
		$code_mirror[this.checked ? "addClass" : "removeClass"]("asm-show-extra-rulers");
	});

	$code_mirror.addClass("asm-show-rulers");
	asm_info_add(null);
	asm_info_add("Initialized.");

};
