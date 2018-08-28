const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const copyright = 'Copyright (c) 2016-2018 Gonçalo Baltazar <me@goncalomb.com>\n\n'
  + 'Source Code on GitHub: https://github.com/goncalomb/p3js\n\n'
  + 'P3JS is released under the terms of the MIT License.\n'
  + 'See LICENSE.txt for details.';


function createBundleConfig(entry, filename, library, plugins) {
  const output = {
    path: path.join(__dirname, 'www'),
    filename: `static/p3js/${filename}`,
  };
  if (library) {
    output.library = library;
  }
  const config = {
    mode: 'none',
    entry,
    output,
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015'],
          },
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
        },
      ],
    },
  };
  if (plugins) {
    config.plugins = plugins;
  }
  return config;
}

module.exports = [
  createBundleConfig('./src/p3js/', 'p3js-bundle.js', 'p3js', [
    new webpack.BannerPlugin(
      `P3JS Bundle\n\nP3 CPU Assembler and Simulator.\nExposes 'window.p3js'.\n\n${copyright}`,
    ),
  ]),
  createBundleConfig('./src/p3js-dom/', 'p3js-dom-bundle.js', ['p3js', 'dom'], [
    new webpack.BannerPlugin(
      `P3JS-DOM Bundle\n\nDOM components for P3JS (p3js.dom).\n\n${copyright}`,
    ),
    new CopyWebpackPlugin([
      { from: 'src/p3js-dom/main.css', to: 'static/p3js/p3js-dom.css' },
    ]),
  ]),
  createBundleConfig('./src/p3js-web/', 'p3js-web-bundle.js', null, [
    new webpack.BannerPlugin(
      `P3JS-WEB Bundle\n\nWeb interface for P3JS.\nExposes 'window.p3sim', an instance of 'p3js.SimulatorWithIO'.\n\n${copyright}`,
    ),
  ]),
];
