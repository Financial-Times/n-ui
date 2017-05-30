const BowerWebpackPlugin = require('bower-webpack-plugin');
const path = require('path');
const glob = require('glob');

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

module.exports = function (options, output) {
	if (!options.language || options.language === 'js') {
		output.module.loaders = output.module.loaders.concat([
			// don't use requireText plugin (use the 'raw' plugin)
			{
				test: /follow-email\.js$/,
				loader: require.resolve('imports-loader'),
				query: 'requireText=>require'
			},
			{
				test: /\.html$/,
				loader: 'handlebars?' + JSON.stringify(handlebarsConfig())
			}
		]);
		output.plugins.push(
			new BowerWebpackPlugin({ includes: /\.js$/, modulesDirectories: path.resolve('./bower_components') })
		)
		output.resolveLoader.alias.raw = require.resolve('raw-loader');
		output.resolveLoader.alias.imports = require.resolve('imports-loader');
	}
}
