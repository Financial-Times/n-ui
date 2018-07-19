const webpackMerge = require('webpack-merge');
const { webpackConfigFormula } = require('../build/webpack/webpack.common.config.js');

const demoEntryPoints = {
	entry: {
		'./public/main.js': './demo/client/main.js'
	}
};

module.exports = [
	webpackMerge(
		webpackConfigFormula({ includeExternals: true }),
		demoEntryPoints
	),
	webpackConfigFormula({ includeAppShell: true })
];
