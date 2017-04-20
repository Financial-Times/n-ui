const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');

module.exports = function (config) {
	config.plugins.push(new ExtractCssBlockPlugin());
	return config;
}
