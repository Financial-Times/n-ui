/*
	n-ui webpack config
	local app shell entry points
*/

const nUiPath = require(`${process.cwd()}/bower.json`).name === 'n-ui'
		? './'
		: './bower_components/n-ui/';

module.exports = {
	entry: {
		'./public/n-ui/appshell.js': `${nUiPath}browser/bundles/main.js`,
		'./public/n-ui/font-loader.js': `${nUiPath}browser/bundles/font-loader.js`,
		'./public/n-ui/o-errors.js': `${nUiPath}browser/bundles/o-errors/index.js`,
		'./public/n-ui/o-ads.js': `${nUiPath}browser/bundles/o-ads.js`
	}
};
