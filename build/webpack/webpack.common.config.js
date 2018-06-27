const webpackMerge = require('webpack-merge');

const config = {
	commonOptions: require('./common'),
	externals: require('./externals'),
	appShell: require('./app-shell-entry-points'),
	es5: require('./loaders/es5'),
	es6: require('./loaders/es6'),
	templates: require('./loaders/templates'),
	text: require('./loaders/text')
};

const webpackConfig = (configKeys = []) =>
	webpackMerge(...configKeys.map(key => config[key]));

function webpackConfigFormula ({
	includeExternals = false,
	includeAppShell = false,
	jsLoader = 'es5'
}) {
	const configKeys = [
		'commonOptions',
		jsLoader,
		'templates',
		'text'
	];
	if (includeExternals) {
		configKeys.push('externals');
	}
	if (includeAppShell) {
		configKeys.push('appShell');
	}
	return webpackConfig(configKeys);
}


module.exports = {
	webpackConfig,
	webpackConfigFormula
};
