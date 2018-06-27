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

module.exports = (configKeys = []) =>
	webpackMerge(...configKeys.map(key => config[key]));
