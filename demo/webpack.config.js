const webpackMerge = require('webpack-merge');
const commonConfig = require('../build/webpack.common.config.js');
const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');
const webpackEntryPoints = require('../build/webpack-entry-points');
const nUiExternal = require('../build/webpack-externals');
const nUiExternalPoints = nUiExternal();

module.exports = [
	webpackMerge(commonConfig, {
		entry: webpackEntryPoints.demo,
		externals: nUiExternalPoints,
		plugins: [
			// splits one stylesheet into multiple stylesheets based on nUiStylesheetStart/End comments
			new ExtractCssBlockPlugin(),
		]
	}),
	webpackMerge(commonConfig, {
		entry: webpackEntryPoints.demoAppShell
	})
];
