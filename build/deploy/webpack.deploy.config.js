/*
This is the webpack config that is bespoke to the pre built n-ui assets.

It uses webpack-merge to add this config to the common config.
If you need to add any config which will be shared amongst an n-ui build and an
app build please add it to the common config.
*/
const webpackMerge = require('webpack-merge');
const commonConfig = require('../webpack.common.config.js');

module.exports = webpackMerge(
	commonConfig(
		'commonOptions',
		'es5',
		'templates',
		'text',
		'appShell'
	),
	{
		output: {
			devtoolModuleFilenameTemplate: 'webpack//n-ui/[resource-path]'
		}
	}
);
