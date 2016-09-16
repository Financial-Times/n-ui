'use strict';

const nWebpack = require('@financial-times/n-webpack');

module.exports = nWebpack({
	withBabelPolyfills: true,
	withHeadCss: true,
	entry: {
		'./public/main-without-n-ui.js': './_test-server/client/main.js',
		'./public/main.css': './_test-server/client/main.scss'
	},
	includes: [
		__dirname
	],
	exclude: [/node_modules/]
});
