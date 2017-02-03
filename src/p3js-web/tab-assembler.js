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
			try {
				p3js.assembly.assembleWithDefaultValidator(text);
			} catch (e) {
				var matches = e.toString().match(/^(.*), on line (\d+)$/);
				if (matches) {
					return [{
						from: CodeMirror.Pos(matches[2] - 1, 0),
						to: CodeMirror.Pos(matches[2] - 1, 80),
						message: matches[1]
					}];
				}
			}
		}
		return [];
	});

	// editor
	var $code = $("#code");

	var rulers = [];
	for (var i = 0; i <= 80; i+= 8) {
		rulers.push({ column: i, className: "asm-ruler-extra", color: "#dadada" });
	}
	rulers.push({ column: 16, className: "asm-ruler", color: "#c0c0ff" });
	rulers.push({ column: 24, className: "asm-ruler", color: "#c0c0ff" });
	rulers.push({ column: 80, className: "asm-ruler", color: "#ffc0c0" });

	var code_mirror = CodeMirror.fromTextArea($code[0], {
		lineNumbers: true,
		indentUnit: 4,
		gutters: ["CodeMirror-lint-markers"],
		lint: true,
		extraKeys: {
			Tab: function(cm) {
				var selections = cm.listSelections();
				var strings = [];
				for (var i = 0, l = selections.length; i < l; i++) {
					var p = selections[i].from().ch;
					if (p < 16) {
						strings.push(Array(16 - p + 1).join(" "));
					} else if (p < 24) {
						strings.push(Array(24 - p + 1).join(" "));
					} else {
						strings.push(Array(cm.getOption("indentUnit") + 1).join(" "));
					}
				}
				cm.replaceSelections(strings);
			}
		},
		rulers: rulers
	});
	var $code_mirror = $(code_mirror.getWrapperElement());
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
				code_mirror.refresh();
			});
		}
	});

	// saved files and demos
	var dirty = false;
	var saved_files = JSON.parse(localStorage.getItem("p3js-saved-files")) || {};
	var current_file = null;
	var current_file_is_demo = false;
	var save_info = "The files are stored on your browser, they are not uploaded to a remote server.\nI recommend making a local copy (click the blue download button) in case something unexpected happens.\n";
	var demos = [
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
	];

	for (var key in saved_files) {
		$asm_editor_files.append($("<option>").val(key).text(key));
	}
	demos.forEach(function(demo) {
		if (typeof demo == "string") {
			$asm_editor_demos.append($("<option>").val(demo).text(demo));
		} else {
			var $optgroup = $("<optgroup>").attr("label", demo.label);
			demo.files.forEach(function(demo) {
				$optgroup.append($("<option>").val(demo).text(demo));
			});
			$asm_editor_demos.append($optgroup);
		}
	});

	code_mirror.on("change", function() {
		dirty = true;
	});
	$(window).on("beforeunload", function() {
		if (dirty) {
			return "It appears that you have unsaved changes.";
		}
	});

	function editor_set(value) {
		code_mirror.setValue(value);
		code_mirror.clearHistory();
		dirty = false;
	}
	function editor_confirm() {
		return !dirty || confirm("It appears that you have unsaved changes. Continue?");
	}
	function editor_set_files_select(value) {
		$asm_editor_files.val(value).attr("data-last", value);
	}
	function editor_set_demos_select(value) {
		$asm_editor_demos.val(value).attr("data-last", value);
	}
	function editor_confirm_for_select($select) {
		if (!editor_confirm()) {
			$select.val($select.attr("data-last"));
			return false;
		}
		$select.attr("data-last", $select.val());
		return true;
	}
	function editor_clear() {
		editor_set_files_select(null);
		editor_set_demos_select(null);
		editor_set("");
		current_file = null;
		current_file_is_demo = false;
		localStorage.removeItem("p3js-current-file");
		$asm_editor_delete.attr("disabled", true);
	}
	function editor_load_file(name, is_demo) {
		if (is_demo) {
			editor_set_files_select(null);
			editor_set("");
			$.get("demos/" + name, null, function(data) {
				editor_set(data);
			}, "text");
			localStorage.removeItem("p3js-current-file");
		} else {
			editor_set_demos_select(null);
			editor_set(saved_files[name]);
			localStorage.setItem("p3js-current-file", name);
		}
		$asm_editor_delete.attr("disabled", is_demo);
		current_file = name;
		current_file_is_demo = is_demo;
	}
	function editor_save() {
		if (!current_file || current_file_is_demo) {
			var new_name = prompt(save_info + "\nFilename:");
			while (true) {
				if (new_name === null) {
					return;
				} else if (!new_name) {
					new_name = prompt("Filename:");
					continue;
				}
				if (new_name.substr(-3) != ".as") {
					new_name += ".as";
				}
				if (saved_files[new_name] === undefined) {
					break;
				}
				new_name = prompt("File exists, choose a different name. Filename:", new_name);
			}
			$asm_editor_files.append($("<option>").val(new_name).text(new_name));
			editor_set_files_select(new_name);
			editor_set_demos_select(null);
			$asm_editor_delete.attr("disabled", false);
			current_file = new_name;
			current_file_is_demo = false;
			localStorage.setItem("p3js-current-file", current_file);
		}
		saved_files[current_file] = code_mirror.getValue();
		localStorage.setItem("p3js-saved-files", JSON.stringify(saved_files));
		dirty = false;
	}

	code_mirror.addKeyMap({
		"Ctrl-S": editor_save
	});

	$asm_editor_files.change(function() {
		$this = $(this);
		if (editor_confirm_for_select($this)) {
			editor_load_file($this.val(), false);
		}
	});
	$asm_editor_demos.change(function() {
		$this = $(this);
		if (editor_confirm_for_select($this)) {
			editor_load_file($this.val(), true);
		}
	});

	current_file = localStorage.getItem("p3js-current-file");
	if (current_file) {
		editor_set_files_select(current_file);
		editor_set_demos_select(null);
		$asm_editor_files.change();
	} else {
		editor_set_files_select(null);
		editor_set_demos_select("welcome.as");
		$asm_editor_demos.change();
	}

	$asm_editor_new.click(function() {
		if (editor_confirm()) {
			editor_clear();
		}
	});
	$asm_editor_save.click(editor_save);
	$asm_editor_download.click(function() {
		var code = code_mirror.getValue();
		if (!code) {
			return;
		} else if (current_file) {
			p3js_web.downloadBuffer(code, current_file);
		} else {
			p3js_web.downloadBuffer(code, "code.as");
		}
	});
	$asm_editor_delete.click(function() {
		if (confirm("Are you sure you want to delete \"" + current_file + "\"?")) {
			delete saved_files[current_file];
			$asm_editor_files.children().filter(function() {
				return $(this).val() == current_file;
			}).remove();
			localStorage.setItem("p3js-saved-files", JSON.stringify(saved_files));
			editor_clear();
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
					var result = p3js.assembly.assembleWithDefaultValidator(code_mirror.getValue());
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
					if (typeof e != "string") {
						asm_info_add("Something is not right (" + e.toString() + ").", "text-danger");
						asm_info_add("Please contact me so I can look into it. Thanks.", "text-info small");
						console.error(e);
					} else if (e.substr(0, 15) == "Internal Error:") {
						asm_info_add("Something is not right with the assembler (" + e.substr(16) + ").", "text-danger");
						asm_info_add("Please contact me so I can look into it. Thanks.", "text-info small");
						console.error(e);
					} else {
						asm_info_add(e, "text-danger");
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
			var name = "code.exe";
			if (current_file) {
				var i = current_file.lastIndexOf(".");
				if (i != -1) {
					name = current_file.substr(0, i) + ".exe";
				} else {
					name = current_file + ".exe";
				}
			}
			p3js_web.downloadBuffer(p3js.writeObjectFormat(result.buffer, false, result.usedAddresses), name);
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
	asm_info_add("Initialized.");

};
