const fs = require('fs');
const path = require('path');
const appShellEntryPoints = require('../app-shell-entry-points');
const verifyGitignore = require('./verify-gitignore');
const webpackMerge = require('webpack-merge');
const baseConfig = require(path.join(process.cwd(), 'n-ui-build.config.js'));
const webpackExternals = require('../webpack-externals');
const commonAppConfig = require('./webpack.app.common.js');
const webpackConfigs = [];

verifyGitignore();

/*
This config is for any JS entry points defined by an app
It excludes anything that is already bundled in n-ui
*/

const jsEntryPoints = Object.keys(baseConfig.entry)
	.map(target => [target, baseConfig.entry[target]])
	.filter(([target, entry]) => /\.(js|ts)$/.test(entry)) //eslint-disable-line no-unused-vars
	.reduce((entryPoints, [target, entry]) => {
		entryPoints[target] = entry;
		return entryPoints;
	}, {});

if (Object.keys(jsEntryPoints).length > 0) {
	const jsWebpackConfig = webpackMerge(commonAppConfig, {
		entry: jsEntryPoints,
		externals: webpackExternals
	});
	webpackConfigs.push(jsWebpackConfig);
}

/*
Setting the NEXT_APP_SHELL environment variable will ensure that during build it
will build and use the local version of n-ui rather than the version hosted on S3
*/
if (process.env.NEXT_APP_SHELL === 'local') {
	const webpackWarning = `
/*********** webpack warning ************/

You have set the environment variable NEXT_APP_SHELL=local
This should only be used if you are actively developing
n-ui/n-html-app within the context of an app (by bower linking
or similar). It will slow down your build A LOT!!!!

If you do not need this behaviour run

	unset NEXT_APP_SHELL

/*********** webpack warning ************/
`;
	console.warn(wbpackWarning); // eslint-disable-line no-console

	const ignoresNUi = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf8')
		.split('\n')
		.some(line => line === '/public/n-ui/');

	if (!ignoresNUi) {
		throw 'Add /public/n-ui/ to your .gitignore to start building a local app shell';
	}

	const appShellWebpackConfig = webpackMerge(commonAppConfig, {
		entry: appShellEntryPoints
	});
	webpackConfigs.push(appShellWebpackConfig);
}

module.exports = webpackConfigs;
