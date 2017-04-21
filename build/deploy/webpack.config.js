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

const configs = [
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
			'./dist/assets/n-ui-core.css': './build/deploy/shared-head.scss'
		},
		withHeadCss: true,
		buildInDev: true
	}
];

if (!process.env.DEV_BUILD) {
	configs.push({
		withBabelPolyfills: false,
		env: 'prod',
		entry: {
			'./dist/assets/es5.min.js': './build/deploy/wrapper.js'
		}
	})
}

module.exports = configs
	.map(conf => nWebpack(Object.assign({}, coreConfig, conf)))


console.log(JSON.stringify(configs, null, 2))
