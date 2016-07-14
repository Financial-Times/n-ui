'use strict';

const nWebpack = require('@financial-times/n-webpack');

module.exports = nWebpack({
	entry: {
		"./public/main.css": "./main.scss"
	},
	includes: [
		__dirname
	]
});
