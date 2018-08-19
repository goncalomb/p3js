export class AssemblyEditor {
  constructor($container, $selectFiles, $selectDemos) {
    this.$container = $container;
    this.$selectFiles = $selectFiles;
    this.$selectDemos = $selectDemos;
    this._dirty = false;
    this._currentFile = null;
    this._currentFileIsDemo = false;
    this._savedFiles = { };
    this._onFileChange = null;

    let rulers = [];
    for (let i = 0; i <= 80; i += 8) {
      rulers.push({ column: i, className: 'asm-ruler-extra', color: '#dadada' });
    }
    rulers.push({ column: 16, className: 'asm-ruler', color: '#c0c0ff' });
    rulers.push({ column: 24, className: 'asm-ruler', color: '#c0c0ff' });
    rulers.push({ column: 80, className: 'asm-ruler', color: '#ffc0c0' });

    this.codeMirror = CodeMirror(this.$container[0], {
      lineNumbers: true,
      indentUnit: 4,
      gutters: ['CodeMirror-lint-markers'],
      lint: true,
      extraKeys: {
        Tab(cm) {
          let selections = cm.listSelections();
          let strings = [];
          for (let i = 0, l = selections.length; i < l; i++) {
            let p = selections[i].from().ch;
            if (p < 16) {
              strings.push(Array(16 - p + 1).join(' '));
            } else if (p < 24) {
              strings.push(Array(24 - p + 1).join(' '));
            } else {
              strings.push(Array(cm.getOption('indentUnit') + 1).join(' '));
            }
          }
          cm.replaceSelections(strings);
        },
      },
      rulers,
    });
    this.codeMirror.on('change', () => {
      this._dirty = true;
    });
    this.codeMirror.addKeyMap({
      'Ctrl-S': () => {
        this.save();
      },
    });
    this.$codeMirror = $(this.codeMirror.getWrapperElement());

    $(window).on('beforeunload', () => {
      if (this._dirty) {
        return 'It appears that you have unsaved changes.';
      }
    });
  }

  _setSelectFiles(value) {
    this.$selectFiles.val(value).attr('data-last', value);
  }

  _setSelectDemos(value) {
    this.$selectDemos.val(value).attr('data-last', value);
  }

  _confirm() {
    return !this._dirty || window.confirm('It appears that you have unsaved changes. Continue?');
  }

  _confirmForSelect($select) {
    if (!this._confirm()) {
      $select.val($select.attr('data-last'));
      return false;
    }
    $select.attr('data-last', $select.val());
    return true;
  }

  _setText(value) {
    this.codeMirror.setValue(value);
    this.codeMirror.clearHistory();
    this._dirty = false;
  }

  _loadFile(name, isDemo) {
    if (isDemo) {
      this._setSelectFiles(null);
      this._setText('');
      $.get({
        url: 'demos/' + name,
        dataType: 'text',
        success: (data) => {
          this._setText(data);
        },
        error: () => {
          if (window.location.protocol === 'file:') {
            this._setText("; Failed to load demo.\n; Some browsers won't be able to load demos when running locally (file://).\n");
          }
        },
      });
      localStorage.removeItem('p3js-current-file');
    } else {
      this._setSelectDemos(null);
      this._setText(this._savedFiles[name]);
      localStorage.setItem('p3js-current-file', name);
    }
    this._currentFile = name;
    this._currentFileIsDemo = isDemo;
    if (this._onFileChange) this._onFileChange(this._currentFile, this._currentFileIsDemo);
  }

  onFileChange(fn) {
    this._onFileChange = fn;
  }

  loadFiles(demos) {
    this.$selectFiles.html('<option style="display: none;" value="" disabled selected> -- select a file -- </option>');
    this.$selectDemos.html('<option style="display: none;" value="" disabled selected> -- select a demo -- </option>');

    this._savedFiles = JSON.parse(localStorage.getItem('p3js-saved-files')) || { };
    Object.keys(this._savedFiles).forEach((key) => {
      this.$selectFiles.append($('<option>').val(key).text(key));
    });

    demos.forEach((demo) => {
      if (typeof demo === 'string') {
        this.$selectDemos.append($('<option>').val(demo).text(demo));
      } else {
        let $optgroup = $('<optgroup>').attr('label', demo.label);
        demo.files.forEach((file) => {
          $optgroup.append($('<option>').val(file).text(file));
        });
        this.$selectDemos.append($optgroup);
      }
    });

    this.$selectFiles.change((e) => {
      let $this = $(e.currentTarget);
      if (this._confirmForSelect($this)) {
        this._loadFile($this.val(), false);
      }
    });
    this.$selectDemos.change((e) => {
      let $this = $(e.currentTarget);
      if (this._confirmForSelect($this)) {
        this._loadFile($this.val(), true);
      }
    });

    this._currentFile = localStorage.getItem('p3js-current-file');
    if (this._currentFile) {
      this._setSelectFiles(this._currentFile);
      this._setSelectDemos(null);
      this.$selectFiles.change();
    } else {
      this._setSelectFiles(null);
      if (demos.length && typeof demos[0] === 'string') {
        this._setSelectDemos(demos[0]);
        this.$selectDemos.change();
      } else {
        this._setSelectDemos(null);
      }
    }
  }

  getValue() {
    return this.codeMirror.getValue();
  }

  clear() {
    this._setSelectFiles(null);
    this._setSelectDemos(null);
    this._setText('');
    this._currentFile = null;
    this._currentFileIsDemo = false;
    localStorage.removeItem('p3js-current-file');
    if (this._onFileChange) this._onFileChange(this._currentFile, this._currentFileIsDemo);
  }

  new() {
    if (this._confirm()) {
      this.clear();
    }
  }

  save() {
    if (!this._currentFile || this._currentFileIsDemo) {
      let new_name = prompt(this.constructor.SAVE_MESSAGE + '\nFilename:');
      while (true) {
        if (new_name === null) {
          return;
        } else if (!new_name) {
          new_name = prompt('Filename:');
          continue;
        }
        if (new_name.substr(-3) !== '.as') {
          new_name += '.as';
        }
        if (this._savedFiles[new_name] === undefined) {
          break;
        }
        new_name = prompt('File exists, choose a different name. Filename:', new_name);
      }
      this.$selectFiles.append($('<option>').val(new_name).text(new_name));
      this._setSelectFiles(new_name);
      this._setSelectDemos(null);
      this._currentFile = new_name;
      this._currentFileIsDemo = false;
      localStorage.setItem('p3js-current-file', this._currentFile);
      if (this._onFileChange) this._onFileChange(this._currentFile, this._currentFileIsDemo);
    }
    this._savedFiles[this._currentFile] = this.getValue();
    localStorage.setItem('p3js-saved-files', JSON.stringify(this._savedFiles));
    this._dirty = false;
  }

  delete() {
    if (this._currentFile && !this._currentFileIsDemo && window.confirm('Are you sure you want to delete "' + this._currentFile + '"?')) {
      delete this._savedFiles[this._currentFile];
      let name = this._currentFile;
      this.$selectFiles.children().filter((index, elem) => {
        return $(elem).val() === name;
      }).remove();
      localStorage.setItem('p3js-saved-files', JSON.stringify(this._savedFiles));
      this.clear();
    }
  }

  getFileName(ext) {
    if (!this._currentFile) {
      return (ext ? 'code.' + ext : 'code.as');
    } else if (!ext) {
      return this._currentFile;
    } else {
      let i = this._currentFile.lastIndexOf('.');
      if (i !== -1) {
        return this._currentFile.substr(0, i + 1) + ext;
      }
      return this._currentFile + '.' + ext;
    }
  }
}

AssemblyEditor.SAVE_MESSAGE = 'The files are stored on your browser, they are not uploaded to a remote server.\nI recommend "downloading" a copy in case something unexpected happens.\n';
