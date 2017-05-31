const nWebpack = require('../webpack/webpack.config.js');
const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');

// TODO: describe what these configs actually do and what they're for
const configs = [
	{
		prod: false,
		entry: { './dist/assets/es5.js': './build/deploy/wrapper.js' },
	},
	{
		prod: true,
		withHeadCss: true,
		entry: { './dist/assets/n-ui-core.css': './build/deploy/shared-head.scss' },
	}
];

if (!process.env.DEV_BUILD) {
	configs.push({
		prod: true,
		entry: { './dist/assets/es5.min.js': './build/deploy/wrapper.js' }
	})
}

module.exports = configs
	.map(config => {
		const webpackConfig = nWebpack();
		webpackConfig.entry = config.entry;
		if (config.withHeadCss) {
			// TODO: figure out what this is for and describe it
			webpackConfig.plugins.push(new ExtractCssBlockPlugin());
		}
		if (config.prod) {
			const webpack = require('webpack');
			// TODO: figure out what these are for and describe them
			webpackConfig.plugins.push(new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } })) /* Only if production */
			webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({ 'compress': { 'warnings': false } }))
		}
		return webpackConfig
	})
