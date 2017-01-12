'use strict';
const nWebpack = require('@financial-times/n-webpack');
const fs = require('fs');
const AsciiTable = require('ascii-table');

// Create an ascii table with metadata about the contents of the bundle
let deps = fs.readdirSync('./bower_components').map(dir => {
	if (dir === 'n-ui') {
		return 'n-ui@' + process.env.CIRCLE_TAG;
	} else {
		try {
			return dir + '@' + require(`./bower_components/${dir}/.bower.json`).version;
		} catch (e) {
			return dir + '@bower-linked'
		}
	}
})
	.concat([
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
	include: [/.*/],
	exclude: [/node_modules/],
	wrap: {
		before: '/*\n' + depsTable.toString() + '\n*/'
	}
};

// Build variants of the bundle that work with different combinations of feature flags
// Only build some of them when bower linking in dev to save build time
module.exports = [
	{
		withBabelPolyfills: false,
		env: 'dev',
		entry: {
			'./dist/assets/es5.js': './_deploy/wrapper.js'
		},
		buildInDev: true
	},
	{
		withBabelPolyfills: false,
		env: 'prod',
		entry: {
			'./dist/assets/es5.min.js': './_deploy/wrapper.js'
		}
	},
	{
		withBabelPolyfills: false,
		env: 'prod',
		entry: {
			'./dist/assets/n-ui-core.css': './_deploy/shared-head.scss'
		},
		withHeadCss: true,
		wrap: undefined,
		buildInDev: true
	}
]
.filter(conf => conf.buildInDev || !process.env.DEV_BUILD)
.map(conf => nWebpack(Object.assign({}, coreConfig, conf)));
