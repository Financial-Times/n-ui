const webpackMerge = require('webpack-merge');
const commonConfig = require('../build/webpack.common.config.js');
const appShellEntryPoints = require('../build/app-shell-entry-points');
const nUiExternal = require('../build/webpack-externals');

// Automagically generate ES6 equivalents for each ES5 endpoint.
const getES6EntryPoints = entryPoints => {
	const entryPointsES6 = {};
	Object.keys(entryPoints).forEach(key => {
		const newKey = key.replace('.js', '.es6.js');
		entryPointsES6[newKey] = entryPoints[key];
	});
	return entryPointsES6;
};

module.exports = [
	webpackMerge(commonConfig.es5, {
		entry: {
			'./public/main.js': './demo/client/main.js'
		},
		externals: nUiExternal
	}),
	webpackMerge(commonConfig.es5, {
		entry: appShellEntryPoints
	}),
	webpackMerge(commonConfig.es6, {
		entry: {
			'./public/main.js': './demo/client/main.js'
		},
		externals: nUiExternal
	}),
	webpackMerge(commonConfig.es6, {
		entry: getES6EntryPoints(appShellEntryPoints)
	})
];
