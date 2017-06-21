const webpackMerge = require('webpack-merge');
const commonConfig = require('../build/webpack.common.config.js');
const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');

module.exports = webpackMerge(commonConfig, {
	entry: {
		'./public/main-without-n-ui.js': './demo/client/main.js',
		'./public/main.css': './demo/client/main.scss'
	},
	plugins: [
		// splits one stylesheet into multiple stylesheets based on nUiStylesheetStart/End comments
		new ExtractCssBlockPlugin(),
	]
});
