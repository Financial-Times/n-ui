const pathToNUi = require('../bower.json').name === 'n-ui' ? './' : './bower_components/n-ui/';
const appShellEntry = {
	'./public/n-ui/es5.js': `${pathToNUi}browser/bundles/main.js`,
	'./public/n-ui/font-loader.js': `${pathToNUi}browser/bundles/font-loader.js`,
	'./public/n-ui/o-errors.js': `${pathToNUi}browser/bundles/o-errors.js`,
};

module.exports = {
	demo: {
		'./public/main-without-n-ui.js': './demo/client/main.js',
		'./public/main.css': './demo/client/main.scss'
	},
	appShell: appShellEntry,
	deploy: Object.assign({}, appShellEntry, {
		'./public/n-ui/n-ui-core.css': './browser/bundles/main.scss'
	}),
	appDefault: {
		'./public/main.css': './client/main.scss'
	},
	appJs: {
		'./public/main-without-n-ui.js': './client/main.js'
	}
};
