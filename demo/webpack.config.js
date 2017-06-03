const nWebpack = require('../build/webpack/webpack.config.js');
const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');
const path = require('path');
const webpackConfig = nWebpack();

// HACK: adds path to the babel loader config
webpackConfig.module.loaders[0].include.push(new RegExp(path.join(__dirname, '../')))

webpackConfig.plugins.push(new ExtractCssBlockPlugin());
webpackConfig.entry = {
	'./public/main-without-n-ui.js': './demo/client/main.js',
	'./public/main.css': './demo/client/main.scss'
}

module.exports = webpackConfig;
