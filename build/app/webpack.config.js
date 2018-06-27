const fs = require('fs');
const path = require('path');
const verifyGitignore = require('./verify-gitignore');

const webpackMerge = require('webpack-merge');
const { webpackConfigFormula } = require('../webpack/webpack.common.config.js');

const baseConfig = require(path.join(process.cwd(), 'n-ui-build.config.js'));

const webpackConfigs = [];

verifyGitignore();

/*
This config is for any JS entry points defined by an app
It excludes anything that is already bundled in n-ui
*/

const jsEntryPoints = Object.keys(baseConfig.entry)
	.map(target => [target, baseConfig.entry[target]])
	.filter(([, entry]) => /\.(js|ts)$/.test(entry))
	.reduce((entryPoints, [target, entry]) => {
		entryPoints[target] = entry;
		return entryPoints;
	}, {});

if (Object.keys(jsEntryPoints).length) {
	const entrypoints = {
		entry: jsEntryPoints
	};
	webpackConfigs.push(
		webpackMerge(
			webpackConfigFormula({ includeExternals: true }),
			entrypoints
		),
		webpackMerge(
			webpackConfigFormula({ includeExternals: true, jsLoader: 'es6' }),
			entrypoints
		)
	);
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
	console.warn(webpackWarning); // eslint-disable-line no-console

	const ignoresNUi = fs
		.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf8')
		.split('\n')
		.some(line => line === '/public/n-ui/');

	if (!ignoresNUi) {
		throw 'Add /public/n-ui/ to your .gitignore to start building a local app shell';
	}

	webpackConfigs.push(
		webpackConfigFormula({ includeAppShell: true }),
		webpackConfigFormula({ includeAppShell: true, jsLoader: 'es6' })
	);
}

module.exports = webpackConfigs;
