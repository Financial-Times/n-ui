/*
	n-ui webpack config
	bespoke to the pre built n-ui assets
	stored on s3
*/

const { webpackConfigFormula } = require('../webpack/webpack.common.config.js');

module.exports = [
	webpackConfigFormula({ includeAppShell: true })
];
