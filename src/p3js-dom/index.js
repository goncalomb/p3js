var dom = module.exports = { };

if (typeof window != "undefined" && typeof window.p3js != "undefined") {
	window.p3js.dom = dom;
} else {
	throw "p3js-dom: p3js not found";
}

dom.AssemblyEditor = require("./AssemblyEditor.js");
dom.IOBoard = require("./IOBoard.js");
dom.IOTextAreaTerminal = require("./IOTextAreaTerminal.js");
dom.MemoryFootprintChart = require("./MemoryFootprintChart.js");
