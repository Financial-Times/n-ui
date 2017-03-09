'use strict';
const nWebpack = require('@financial-times/n-webpack');

const coreConfig = {
	output: {
		filename: '[name]',
		library: 'ftNextUi',
		devtoolModuleFilenameTemplate: 'n-ui//[resource-path]?[loaders]'
	},
	include: [/.*/],
	exclude: [/node_modules/]
};

// Build variants of the bundle that work with different combinations of feature flags
// Only build some of them when bower linking in dev to save build time
module.exports = [
	{
		withBabelPolyfills: false,
		env: 'dev',
		entry: {
			'./dist/assets/es5.js': './build/deploy/wrapper.js'
		},
		buildInDev: true
	},
	{
		withBabelPolyfills: false,
		env: 'prod',
		entry: {
			'./dist/assets/es5.min.js': './build/deploy/wrapper.js'
		}
	},
	{
		withBabelPolyfills: false,
		env: 'prod',
		entry: {
			'./dist/assets/n-ui-core.css': './build/deploy/shared-head.scss'
		},
		withHeadCss: true,
		wrap: undefined,
		buildInDev: true
	}
]
.filter(conf => conf.buildInDev || !process.env.DEV_BUILD)
.map(conf => nWebpack(Object.assign({}, coreConfig, conf)));
