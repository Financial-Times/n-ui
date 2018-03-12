/*
This is the webpack config that is shared amongst building an individual app's js & css.

It uses webpack-merge to add this config to the common config.
If you need to add any config which will be shared amongst an app build and an
n-ui build please add it to the common config.
*/

const path = require('path');
const glob = require('glob');
const webpackMerge = require('webpack-merge');
const commonConfig = require('../webpack.common.config.js');

const handlebarsConfig = () => {
	const extraHelperDirs = glob.sync('**/node_modules/@financial-times/**/handlebars-helpers')
		.map(dir => path.resolve(dir));
	return {
		debug: false, // set to true to debug finding partial/helper issues
		extensions: ['.html'],
		helperDirs: [
			path.resolve('./node_modules/@financial-times/n-handlebars/src/helpers'),
			path.resolve('./server/helpers'),
			path.resolve('./bower_components/n-concept/handlebars-helpers')
		].concat(extraHelperDirs),
		partialDirs: [
			path.resolve('./bower_components'),
			path.resolve('./node_modules/@financial-times'),
			path.resolve('./views/universal')
		]
	};
};

const appCommonConfiguration = {
	module: {
		// These rules are added to the common ones rather than replacing them
		rules: [
			{
				test: /\.html$/,
				loader: 'handlebars-loader',
				options: handlebarsConfig()
			},
			{
				test: /\.txt$/,
				loader: 'raw-loader'
			}
		]
	}
};

module.exports = {
	es5: webpackMerge(commonConfig.es5, appCommonConfiguration),
	es6: webpackMerge(commonConfig.es6, appCommonConfiguration)
};
