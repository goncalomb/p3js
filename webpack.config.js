var webpack = require("webpack");
var path = require("path");

module.exports = {
	entry: [ "./src/p3js.js" ],
	output: {
		path: path.join(__dirname, "www", "scripts"),
		filename: "p3js-bundle.js",
	},
	plugins: [
		new webpack.BannerPlugin(
			"P3JS Core Bundle\n" +
			"Creates 'window.p3js'."
		)
	]
};
