const webpack = require('webpack');

module.exports = function (options, output) {
	let isProd = false;
	if ('env' in options && options.env === 'prod') {
		isProd = true;
	}
	if (!('env' in options) && process.argv.indexOf('--dev') === -1) {
		isProd = true;
	}
	if (isProd) {
		output.isProd = true;
		output.plugins.push(new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }));
		if (options.ECMAScriptVersion <= 5) {
			output.plugins.push(new webpack.optimize.UglifyJsPlugin({ 'compress': { 'warnings': false } }));
		}
	}
}
