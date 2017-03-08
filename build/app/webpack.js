const path = require('path');
const nWebpack = require('@financial-times/n-webpack');

module.exports = nWebpack(Object.assign({}, {
	withHeadCss: true,
	withHashedAssets: true
}, require(path.join(process.cwd(), 'n-ui-build.config.js'))), true);
