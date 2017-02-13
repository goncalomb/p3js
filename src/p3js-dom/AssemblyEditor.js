var AssemblyEditor = module.exports = function($container, $selectFiles, $selectDemos, demos) {
	this.$container = $container;
	this.$selectFiles = $selectFiles;
	this.$selectDemos = $selectDemos;
	this._dirty = false;
	this._currentFile = null;
	this._currentFileIsDemo = false;
	this._savedFiles = { };
	this._onFileChange = null;

	var rulers = [];
	for (var i = 0; i <= 80; i+= 8) {
		rulers.push({ column: i, className: "asm-ruler-extra", color: "#dadada" });
	}
	rulers.push({ column: 16, className: "asm-ruler", color: "#c0c0ff" });
	rulers.push({ column: 24, className: "asm-ruler", color: "#c0c0ff" });
	rulers.push({ column: 80, className: "asm-ruler", color: "#ffc0c0" });

	var self = this;

	this.codeMirror = CodeMirror(this.$container[0], {
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
	this.codeMirror.on("change", function() {
		self._dirty = true;
	});
	this.codeMirror.addKeyMap({
		"Ctrl-S": function() {
			self.save();
		}
	});
	this.$codeMirror = $(this.codeMirror.getWrapperElement());

	$(window).on("beforeunload", function() {
		if (self._dirty) {
			return "It appears that you have unsaved changes.";
		}
	});
}

AssemblyEditor.SAVE_MESSAGE = "The files are stored on your browser, they are not uploaded to a remote server.\nI recommend \"downloading\" a copy in case something unexpected happens.\n";

AssemblyEditor.prototype._setSelectFiles = function(value) {
	this.$selectFiles.val(value).attr("data-last", value);
}

AssemblyEditor.prototype._setSelectDemos = function(value) {
	this.$selectDemos.val(value).attr("data-last", value);
}

AssemblyEditor.prototype._confirm = function() {
	return !this._dirty || confirm("It appears that you have unsaved changes. Continue?");
}

AssemblyEditor.prototype._confirmForSelect = function($select) {
	if (!this._confirm()) {
		$select.val($select.attr("data-last"));
		return false;
	}
	$select.attr("data-last", $select.val());
	return true;
}

AssemblyEditor.prototype._setText = function(value) {
	this.codeMirror.setValue(value);
	this.codeMirror.clearHistory();
	this._dirty = false;
}

AssemblyEditor.prototype._loadFile = function(name, isDemo) {
	if (isDemo) {
		this._setSelectFiles(null);
		this._setText("");
		var self = this;
		$.get("demos/" + name, null, function(data) {
			self._setText(data);
		}, "text");
		localStorage.removeItem("p3js-current-file");
	} else {
		this._setSelectDemos(null);
		this._setText(this._savedFiles[name]);
		localStorage.setItem("p3js-current-file", name);
	}
	this._currentFile = name;
	this._currentFileIsDemo = isDemo;
	if (this._onFileChange) this._onFileChange(this._currentFile, this._currentFileIsDemo)
}

AssemblyEditor.prototype.onFileChange = function(fn) {
	this._onFileChange = fn;
}

AssemblyEditor.prototype.loadFiles = function(demos) {
	this.$selectFiles.html("<option style=\"display: none;\" value=\"\" disabled selected> -- select a file -- </option>");
	this.$selectDemos.html("<option style=\"display: none;\" value=\"\" disabled selected> -- select a demo -- </option>");

	this._savedFiles = JSON.parse(localStorage.getItem("p3js-saved-files")) || { };
	for (var key in this._savedFiles) {
		this.$selectFiles.append($("<option>").val(key).text(key));
	}

	var self = this;

	demos.forEach(function(demo) {
		if (typeof demo == "string") {
			self.$selectDemos.append($("<option>").val(demo).text(demo));
		} else {
			var $optgroup = $("<optgroup>").attr("label", demo.label);
			demo.files.forEach(function(demo) {
				$optgroup.append($("<option>").val(demo).text(demo));
			});
			self.$selectDemos.append($optgroup);
		}
	});

	this.$selectFiles.change(function() {
		var $this = $(this);
		if (self._confirmForSelect($this)) {
			self._loadFile($this.val(), false);
		}
	});
	this.$selectDemos.change(function() {
		var $this = $(this);
		if (self._confirmForSelect($this)) {
			self._loadFile($this.val(), true);
		}
	});

	this._currentFile = localStorage.getItem("p3js-current-file");
	if (this._currentFile) {
		this._setSelectFiles(this._currentFile);
		this._setSelectDemos(null);
		this.$selectFiles.change();
	} else {
		this._setSelectFiles(null);
		if (demos.length && typeof demos[0] == "string") {
			this._setSelectDemos(demos[0]);
			this.$selectDemos.change();
		} else {
			this._setSelectDemos(null);
		}
	}
}

AssemblyEditor.prototype.getValue = function() {
	return this.codeMirror.getValue();
}

AssemblyEditor.prototype.clear = function() {
	this._setSelectFiles(null);
	this._setSelectDemos(null);
	this._setText("");
	this._currentFile = null;
	this._currentFileIsDemo = false;
	localStorage.removeItem("p3js-current-file");
	if (this._onFileChange) this._onFileChange(this._currentFile, this._currentFileIsDemo)
}

AssemblyEditor.prototype.new = function() {
	if (this._confirm()) {
		this.clear();
	}
}

AssemblyEditor.prototype.save = function() {
	if (!this._currentFile || this._currentFileIsDemo) {
		var new_name = prompt(this.constructor.SAVE_MESSAGE + "\nFilename:");
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
			if (this._savedFiles[new_name] === undefined) {
				break;
			}
			new_name = prompt("File exists, choose a different name. Filename:", new_name);
		}
		this.$selectFiles.append($("<option>").val(new_name).text(new_name));
		this._setSelectFiles(new_name);
		this._setSelectDemos(null);
		this._currentFile = new_name;
		this._currentFileIsDemo = false;
		localStorage.setItem("p3js-current-file", this._currentFile);
		if (this._onFileChange) this._onFileChange(this._currentFile, this._currentFileIsDemo);
	}
	this._savedFiles[this._currentFile] = this.getValue();
	localStorage.setItem("p3js-saved-files", JSON.stringify(this._savedFiles));
	this._dirty = false;
}

AssemblyEditor.prototype.delete = function() {
	if (this._currentFile && !this._currentFileIsDemo && confirm("Are you sure you want to delete \"" + this._currentFile + "\"?")) {
		delete this._savedFiles[this._currentFile];
		var name = this._currentFile;
		this.$selectFiles.children().filter(function() {
			return $(this).val() == name;
		}).remove();
		localStorage.setItem("p3js-saved-files", JSON.stringify(this._savedFiles));
		this.clear();
	}
}

AssemblyEditor.prototype.getFileName = function(ext) {
	if (!this._currentFile) {
		return (ext ? "code." + ext : "code.as");
	} else if (!ext) {
		return this._currentFile;
	} else {
		var i = this._currentFile.lastIndexOf(".");
		if (i != -1) {
			return this._currentFile.substr(0, i + 1) + ext;
		}
		return this._currentFile + "." + ext;
	}
}
