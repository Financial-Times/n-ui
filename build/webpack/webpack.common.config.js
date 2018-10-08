const webpackMerge = require('webpack-merge');

const configs = {
	commonOptions: require('./common'),
	externals: require('./externals'),
	appShell: require('./app-shell-entry-points'),
	es5: require('./loaders/es5'),
	templates: require('./loaders/templates'),
	text: require('./loaders/text')
};

module.exports = (configKeys = []) => webpackMerge(...configKeys.map(config => {
	if (!Array.isArray(config)) config = [config];
	const [key, opts = {}] = config;
	return typeof configs[key] === 'function' ? configs[key](opts) : configs[key];
}));
