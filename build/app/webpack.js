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
This config is for any JS entry points defined by an application.
It excludes anything that is already bundled in n-ui, unless NEXT_APP_SHELL is set to 'local'.
*/

// Automagically generate ES6 equivalents for each ES5 endpoint.
const getES6EntryPoints = entryPoints => {
	const entryPointsES6 = {};
	Object.keys(entryPoints).forEach(key => {
		const newKey = key.replace('.js', '.es6.js');
		entryPointsES6[newKey] = entryPoints[key];
	});
	return entryPointsES6;
};

const jsEntryPoints = Object.keys(baseConfig.entry)
	.map(target => [target, baseConfig.entry[target]])
	.filter(([target, entry]) => /\.(js|ts)$/.test(entry)) //eslint-disable-line no-unused-vars
	.reduce((entryPoints, [target, entry]) => {
		entryPoints[target] = entry;
		return entryPoints;
	}, {});

if (Object.keys(jsEntryPoints).length > 0) {
	const jsWebpackConfigES5 = webpackMerge(commonAppConfig.es5, {
		entry: jsEntryPoints,
		externals: webpackExternals
	});
	webpackConfigs.push(jsWebpackConfigES5);

	// TODO: Once ES6 modules are working for n-ui bundle files,
	// then move on to ES6 modules for applications' JS files.
	const buildAppES6 = false;
	if (buildAppES6) {
		const jsWebpackConfigES6 = webpackMerge(commonAppConfig.es6, {
			entry: getES6EntryPoints(jsEntryPoints),
			externals: webpackExternals
		});
		webpackConfigs.push(jsWebpackConfigES6);
	}
}

/*
Setting the NEXT_APP_SHELL environment variable to 'local' will ensure that it
will build and use the local version of n-ui rather than the version hosted on S3
*/
if (process.env.NEXT_APP_SHELL === 'local') {
	const nWebpackWarning = `
/*********** n-webpack warning ************/

You have set the environment variable NEXT_APP_SHELL=local
This should only be used if you are actively developing
n-ui/n-html-app within the context of an app (by bower linking
or similar). It will slow down your build A LOT!!!!

If you do not need this behaviour run

	unset NEXT_APP_SHELL

/*********** n-webpack warning ************/
`;
	console.warn(nWebpackWarning); // eslint-disable-line no-console

	const ignoresNUi = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf8')
		.split('\n')
		.some(line => line === '/public/n-ui/');

	if (!ignoresNUi) {
		throw 'Add /public/n-ui/ to your .gitignore to start building a local app shell';
	}

	const appShellWebpackConfigES5 = webpackMerge(commonAppConfig.es5, {
		entry: appShellEntryPoints
	});
	webpackConfigs.push(appShellWebpackConfigES5);

	const appShellWebpackConfigEs6 = webpackMerge(commonAppConfig.es6, {
		entry: getES6EntryPoints(appShellEntryPoints)
	});
	webpackConfigs.push(appShellWebpackConfigEs6);
}

module.exports = webpackConfigs;
