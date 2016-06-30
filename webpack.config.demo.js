'use strict';

const nWebpack = require('@financial-times/n-webpack');

module.exports = nWebpack({
	withBabelPolyfills: true,
	entry: {
		"./public/main.js": "./_demo/client/main.js",
		"./public/main.css": "./_demo/client/main.scss"
	},
	includes: [
		__dirname
	]
});

console.log(module.exports);
