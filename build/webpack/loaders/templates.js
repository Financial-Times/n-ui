/* 
	n-ui webpack config
	ruleset for loading handlebars templates
*/

const path = require('path');
const glob = require('glob');

const handlebarsConfig = () => {
	const extraHelperDirs = glob
		.sync('**/node_modules/@financial-times/**/handlebars-helpers')
		.map(dir => path.resolve(dir));
	return {
		debug: false, // set to true to debug finding partial/helper issues
		extensions: ['.html'],
		helperDirs: [
			path.resolve('./node_modules/@financial-times/n-handlebars/src/helpers'),
			path.resolve('./server/helpers')
		].concat(extraHelperDirs),
		partialDirs: [
			path.resolve('./bower_components'),
			path.resolve('./node_modules/@financial-times'),
			path.resolve('./views/universal')
		]
	};
};

module.exports = {
	module: {
		rules: [
			// handlebars
			{
				test: /\.html$/,
				loader: 'handlebars-loader',
				options: handlebarsConfig()
			}
		]
	}
};
