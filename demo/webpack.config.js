const webpackMerge = require('webpack-merge');
const commonConfig = require('../build/webpack.common.config.js');
const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');
const appShellEntryPoints = require('../app-shell-entry-points');
const nUiExternal = require('../build/webpack-externals');

module.exports = [
	webpackMerge(commonConfig, {
		entry: {
			'./public/main-without-n-ui.js': './demo/client/main.js',
			'./public/main.css': './demo/client/main.scss'
		},
		externals: nUiExternal(),
		plugins: [
			// splits one stylesheet into multiple stylesheets based on nUiStylesheetStart/End comments
			new ExtractCssBlockPlugin(),
		]
	}),
	webpackMerge(commonConfig, {
		entry: appShellEntryPoints
	})
];
