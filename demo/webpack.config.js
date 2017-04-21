'use strict';

const nWebpack = require('@financial-times/n-webpack');
const headCss = require('../build/lib/head-css')
const path = require('path');
const webpackConfig = headCss(nWebpack({
	withBabelPolyfills: false,
	entry: {
		'./public/main-without-n-ui.js': './demo/client/main.js',
		'./public/main.css': './demo/client/main.scss'
	},
	includes: [
		path.join(__dirname, '../')
	],
	exclude: [/node_modules/]
}));

module.exports = webpackConfig;
