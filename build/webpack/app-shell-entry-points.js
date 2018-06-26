/* 
	n-ui webpack config
	local app shell entry points
*/

const pathToNUi = require(`${process.cwd()}/bower.json`).name === 'n-ui' ? './' : './bower_components/n-ui/';

module.exports = {
	entry: {
		'./public/n-ui/vendor.js': `${pathToNUi}browser/bundles/main.js`,
		'./public/n-ui/font-loader.js': `${pathToNUi}browser/bundles/font-loader.js`,
		'./public/n-ui/o-errors.js': `${pathToNUi}browser/bundles/o-errors/index.js`
	}
};
