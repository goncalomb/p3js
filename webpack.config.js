var webpack = require("webpack");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var path = require("path");
var copyright = "Copyright (c) 2016, 2017 Gonçalo Baltazar <me@goncalomb.com>\n\n"
	+ "Source Code on GitHub: https://github.com/goncalomb/p3js\n\n"
	+ "P3JS is released under the terms of the MIT License.\n"
	+ "See LICENSE.txt for details.";

module.exports = [{
	entry: ["./src/p3js/"],
	output: {
		path: path.join(__dirname, "www"),
		filename: "static/p3js/p3js-bundle.js",
	},
	plugins: [
		new webpack.BannerPlugin(
			"P3JS Bundle\n\n" +
			"P3 CPU Assembler and Simulator.\n" +
			"Exposes 'window.p3js'.\n" +
			"\n" + copyright
		)
	]
}, {
	entry: ["./src/p3js-dom/"],
	output: {
		path: path.join(__dirname, "www"),
		filename: "static/p3js/p3js-dom-bundle.js",
	},
	plugins: [
		new webpack.BannerPlugin(
			"P3JS-DOM Bundle\n\n" +
			"DOM components for P3JS (p3js.dom).\n" +
			"\n" + copyright
		),
		new CopyWebpackPlugin([
			{ from: "src/p3js-dom/main.css", to: "static/p3js/p3js-dom.css" }
		])
	]
}, {
	entry: ["./src/p3js-web/"],
	output: {
		path: path.join(__dirname, "www"),
		filename: "static/p3js/p3js-web-bundle.js",
	},
	plugins: [
		new webpack.BannerPlugin(
			"P3JS-WEB Bundle\n\n" +
			"Web interface for P3JS.\n" +
			"Exposes 'window.p3sim', an instance of 'p3js.SimulatorWithIO'.\n" +
			"\n" + copyright
		)
	]
}];
