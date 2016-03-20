var webpack = require("webpack");
var path = require("path");
var output_path = path.join(__dirname, "www", "scripts");
var copyright = "Copyright (C) 2016 Gonçalo Baltazar <me@goncalomb.com>";

module.exports = [{
	entry: "./src/p3js/p3js.js",
	output: {
		path: output_path,
		filename: "p3js-bundle.js",
	},
	plugins: [
		new webpack.BannerPlugin(
			"P3JS Core Bundle\n" +
			"P3 CPU Assembler and Simulator.\n" +
			"Creates 'window.p3js'.\n" +
			"\n" + copyright
		)
	]
}, {
	entry: "./src/p3js-web/main.js",
	output: {
		path: output_path,
		filename: "p3js-web-bundle.js",
	},
	plugins: [
		new webpack.BannerPlugin(
			"P3JS Web Bundle\n" +
			"Web UI for P3JS.\n" +
			"\n" + copyright
		)
	]
}];
