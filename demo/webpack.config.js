const webpackMerge = require('webpack-merge');
const commonConfig = require('../build/webpack.common.config.js');

module.exports = webpackMerge(commonConfig, {
	entry: {
		'./public/main-without-n-ui.js': './demo/client/main.js',
		'./public/main.css': './demo/client/main.scss'
	}
});
