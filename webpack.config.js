'use strict';
const path = require('path');
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

const coreConfig = {
	output: {
		filename: '[name]',
		library: 'ftNextUi',
		devtoolModuleFilenameTemplate: 'n-ui//[resource-path]?[loaders]'
	},
	include: [path.resolve('./_deploy')],
	wrap: {
		before: '/*\n' + depsTable.toString() + '\n*/'
	}
};

module.exports = [
	nWebpack(Object.assign({}, coreConfig, {
		withBabelPolyfills: true,
		env: 'dev',
		entry: {
			"./dist/es5-core-js.js": "./_deploy/wrapper.js"
		},
	})),
	nWebpack(Object.assign({}, coreConfig, {
		withBabelPolyfills: false,
		env: 'dev',
		entry: {
			"./dist/es5-polyfill-io.js": "./_deploy/wrapper.js"
		},
	})),
	nWebpack(Object.assign({}, coreConfig, {
		withBabelPolyfills: true,
		env: 'prod',
		entry: {
			"./dist/es5-core-js.min.js": "./_deploy/wrapper.js"
		},
	})),
	nWebpack(Object.assign({}, coreConfig, {
		withBabelPolyfills: false,
		env: 'prod',
		entry: {
			"./dist/es5-polyfill-io.min.js": "./_deploy/wrapper.js"
		},
	})),
	nWebpack(Object.assign({}, coreConfig, {
		withBabelPolyfills: false,
		env: 'prod',
		entry: {
			"./dist/main.css": "./_deploy/shared-head.scss"
		},
		wrap: undefined
	}))
];
