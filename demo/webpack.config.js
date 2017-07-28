const webpackMerge = require('webpack-merge');
const commonConfig = require('../build/webpack.common.config.js');
const appShellEntryPoints = require('../build/app-shell-entry-points');
const nUiExternal = require('../build/webpack-externals');

module.exports = [
	webpackMerge(commonConfig, {
		entry: {
			'./public/main-without-n-ui.js': './demo/client/main.js'
		},
		externals: nUiExternal()
	}),
	webpackMerge(commonConfig, {
		entry: appShellEntryPoints
	})
];
