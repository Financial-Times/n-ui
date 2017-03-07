'use strict';

const nWebpack = require('@financial-times/n-webpack');
const path = require('path');
module.exports = nWebpack({
	withBabelPolyfills: false,
	withHeadCss: true,
	entry: {
		'./public/main-without-n-ui.js': './_test-server/client/main.js',
		'./public/main.css': './_test-server/client/main.scss'
	},
	includes: [
		path.join(__dirname, '../')
	],
	exclude: [/node_modules/]
});
