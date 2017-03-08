'use strict';

const nWebpack = require('@financial-times/n-webpack');
const path = require('path');
module.exports = nWebpack({
	withBabelPolyfills: false,
	withHeadCss: true,
	entry: {
		'./public/main-without-n-ui.js': './demo/client/main.js',
		'./public/main.css': './demo/client/main.scss'
	},
	includes: [
		path.join(__dirname, '../')
	],
	exclude: [/node_modules/]
});
