'use strict';

const nWebpack = require('@financial-times/n-webpack');
const fs = require('fs');
const AsciiTable = require('ascii-table');

let deps = fs.readdirSync('./bower_components').map(dir => {
	return dir + `@` + require(`./bower_components/${dir}/.bower.json`).version;
}).concat([
	'preact@' + require('./node_modules/preact/package.json').version,
	'preact-compat@' + require('./node_modules/preact-compat/package.json').version,
]);

const depsTable = new AsciiTable('Dependencies');
depsTable.removeBorder();
while (deps.length) {
	depsTable.addRow(deps.splice(0, 4));
}

module.exports = [
	nWebpack({
		output: {
			filename: '[name]',
			library: 'ftNextUi'
		},
		withBabelPolyfills: true,
		entry: {
			"./dist/es5-core-js.js": "./_deploy/wrapper.js"
		},
		wrap: {
			before: '/*\n' + depsTable.toString() + '\n*/'
		}
	}),
	nWebpack({
		output: {
			filename: '[name]',
			library: 'ftNextUi'
		},
		withBabelPolyfills: false,
		entry: {
			"./dist/es5-polyfill-io.js": "./_deploy/wrapper.js"
		},
		wrap: {
			before: '/*\n' + depsTable.toString() + '\n*/'
		}
	})
];
