'use strict';

const nWebpack = require('@financial-times/n-webpack');
const fs = require('fs');
const deps = fs.readdirSync('./bower_components').map(dir => {
	return dir + `@` + require(`./bower_components/${dir}/.bower.json`).version;
}).concat([
	'preact@' + require('./node_modules/preact/package.json').version,
	'preact-compat@' + require('./node_modules/preact-compat/package.json').version,
]).join('\t\t\t');

module.exports = nWebpack({
	output: {
		filename: '[name]',
		library: 'ftNextUi'
	},
	externals: {'n-ui': null},
	withBabelPolyfills: true,
	entry: {
		"./dist/es5.js": "./_deploy/wrapper.js"
	},
	wrap: {
		before: '/*\n' + deps + '\n*/'
	}
});
