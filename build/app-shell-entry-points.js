const pathToNUi = require('../bower.json').name === 'n-ui' ? './' : './bower_components/n-ui/';

module.exports = {
	'./public/n-ui/es5.js': `${pathToNUi}browser/bundles/main.js`,
	'./public/n-ui/font-loader.js': `${pathToNUi}browser/bundles/font-loader.js`,
	'./public/n-ui/o-errors.js': `${pathToNUi}browser/bundles/o-errors.js`,
};
