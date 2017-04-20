const webpack = require('webpack');
const AssetHashes = require('../addons/asset-hashes');

module.exports = function (options, output) {
	let isProd = false;
	if ('env' in options && options.env === 'prod') {
		isProd = true;
	}
	if (!('env' in options) && process.argv.indexOf('--dev') === -1) {
		isProd = true;
	}
	if (isProd) {

		output.plugins.push(new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }));
		if (options.ECMAScriptVersion <= 5) {
			output.plugins.push(new webpack.optimize.UglifyJsPlugin({ 'compress': { 'warnings': false } }));
		}
		if (options.withHashedAssets === true) {
			output.plugins.push(new AssetHashes());
		}
	}
}
