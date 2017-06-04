/*
 * Copyright (c) 2016, 2017 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

var dom = module.exports = { };

if (typeof window != "undefined" && typeof window.p3js != "undefined") {
	window.p3js.dom = dom;
} else {
	throw "p3js-dom: p3js not found";
}

dom.AssemblyEditor = require("./AssemblyEditor.js");
dom.DebugPanel = require("./DebugPanel.js");
dom.InfoPanel = require("./InfoPanel.js");
dom.IOBoard = require("./IOBoard.js");
dom.IOTextAreaTerminal = require("./IOTextAreaTerminal.js");
dom.MemoryFootprintChart = require("./MemoryFootprintChart.js");
dom.MemoryViewPanel = require("./MemoryViewPanel.js");
dom.ROMEditor = require("./ROMEditor.js");
