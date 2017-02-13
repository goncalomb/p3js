/*
 * Copyright (c) 2016 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

var p3js = module.exports = { };

if (typeof window != "undefined") {
	window.p3js = p3js;
}

p3js.inherit = function(base, constructor) {
	var tmp = function() { };
	tmp.prototype = base.prototype;
	constructor.prototype = new tmp();
	constructor.prototype.constructor = constructor;
	constructor._super = base;
	return constructor;
}

p3js.devices = require("./devices");
p3js.assembly = require("./assembly");
p3js.io = require("./io");
p3js.program = require("./program.js");
p3js.Simulator = require("./Simulator.js");
p3js.SimulatorWithIO = require("./SimulatorWithIO.js");
