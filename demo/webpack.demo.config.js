const webpackMerge = require('webpack-merge');
const commonConfig = require('../build/webpack/webpack.common.config.js');

module.exports = [
	webpackMerge(commonConfig([
		'commonOptions',
		'es5',
		'templates',
		'text',
		'externals'
	]), {
		entry: {
			'./public/main.js': './demo/client/main.js'
		}
	}),
	commonConfig([
		'commonOptions',
		'es5',
		'templates',
		'text',
		'appShell'
	])
];
