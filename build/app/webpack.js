const fs = require('fs');
const path = require('path');
const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');
const webpackEntryPoints = require('../webpack-entry-points');
const verifyGitignore = require('./verify-gitignore');

function filterEntryKeys (obj, rx, negativeMatch) {
	const keys = Object.keys(obj).filter(key => negativeMatch ? !rx.test(key) : rx.test(key));
	return keys.reduce((o, key) => {
		o[key] = obj[key];
		return o;
	}, {});
}

verifyGitignore();

const baseConfig = require(path.join(process.cwd(), 'n-ui-build.config.js'));
const webpackConfigs = [];

/*
We no longer build a main.js for the app when generating the standard asset variants
so this config is for all entry points defined by an app *excluding* the main.js one

Mostly this config will only be for main.css.
*/

const webpackMerge = require('webpack-merge');
const commonAppConfig = require('./webpack.app.common.js');


const nonMainJsWebpackConfig = webpackMerge(commonAppConfig, {
	entry: baseConfig.entry ? filterEntryKeys(baseConfig.entry, /main\.js$/, true) : webpackEntryPoints.appJs,
	plugins:[
		new ExtractCssBlockPlugin()
	]
});
webpackConfigs.push(nonMainJsWebpackConfig);


/*
This webpack config is for the main.js entry point. Because of reasons we rename
build to a file called main-without-n-ui.js rather than main.js.

During build it also wraps the main.js code to ensure it is only called once n-ui
has been loaded.
*/
const nUiExternal = require('../webpack-externals');
const nUiExternalPoints = nUiExternal(baseConfig.nUiExcludes);
const mainJsWebpackConfig = webpackMerge(commonAppConfig, {
	entry: webpackEntryPoints.appJs,
	externals: nUiExternalPoints
});
webpackConfigs.push(mainJsWebpackConfig);


/*
Setting the NEXT_APP_SHELL environment variable will ensure that during build it
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

	const appShellWebpackConfig = webpackMerge(commonAppConfig, {
		entry: webpackEntryPoints.appShell
	});
	webpackConfigs.push(appShellWebpackConfig);
}

module.exports = webpackConfigs;
