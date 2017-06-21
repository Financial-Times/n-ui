/*
This is the webpack config that is bespoke to the pre built n-ui assets.

It uses webpack-merge to add this config to the common config.
If you need to add any config which will be shared amongst an n-ui build and an
app build please add it to the common config.
*/

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');
const commonConfig = require('../webpack.common.config.js');

module.exports = webpackMerge(commonConfig, {

	entry: {
		'./dist/assets/es5.js': './build/deploy/wrapper.js',
		'./dist/assets/es5.min.js': './build/deploy/wrapper.js',
		'./dist/assets/n-ui-core.css': './build/deploy/shared-head.scss',
	},

	// These plugins are added to the common plugins rather than replacing them
	plugins: [
		// splits one stylesheet into multiple stylesheets based on nUiStylesheetStart/End comments
		new ExtractCssBlockPlugin(),

		// Minify & Uglify all the JS
		new webpack.optimize.UglifyJsPlugin({
			test: /\.min\.js$/,
			sourceMap: true
		}),
	],
});
