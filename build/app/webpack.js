const path = require('path');
const nWebpack = require('../webpack/webpack.config.js');
const fs = require('fs');
const join = require('path').join;
const Wrap = require('../lib/addons/wrap');
const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');

const gitignore = fs.readFileSync(join(process.cwd(), '.gitignore'), 'utf8')
	.split('\n');


function noGitignoreWildcard () {
	gitignore.forEach(pattern => {
		if (/^\/?public\/(.*\/\*|\*|$)/.test(pattern)) {
			if (pattern !== '/public/n-ui/') {
				throw new Error('Wildcard pattern or entire directories (i.e. /public/) for built public assets not allowed in your .gitignore. Please specify a path for each file');
			}
		}
	});
}

function modifyEntryKeys (obj, rx, nameModifier) {
	const keys = Object.keys(obj).filter(key => rx.test(key))
	return keys.reduce((o, key) => {
		o[nameModifier(key)] = obj[key]
		return o;
	}, {})
}

function filterEntryKeys (obj, rx, negativeMatch) {
	const keys = Object.keys(obj).filter(key => negativeMatch ? !rx.test(key) : rx.test(key))
	return keys.reduce((o, key) => {
		o[key] = obj[key]
		return o;
	}, {})
}

const baseConfig = require(path.join(process.cwd(), 'n-ui-build.config.js'));

noGitignoreWildcard();

const webpackConfigs = [];

/*
We no longer build a main.js for the app when generating the standard asset variants
so this config is for all entry points defined by an app *excluding* the main.js one

Mostly this config will only be for main.css.
*/
const nonMainJsWebpackConfig = nWebpack();
nonMainJsWebpackConfig.entry = filterEntryKeys(baseConfig.entry, /main\.js$/, true);
nonMainJsWebpackConfig.plugins.push(new ExtractCssBlockPlugin());
webpackConfigs.push(nonMainJsWebpackConfig);



/*
This webpack config is for the main.js entry point. Because of reasons we rename
build to a file called main-without-n-ui.js rather than main.js.

During build it also wraps the main.js code to ensure it is only called once n-ui
has been loaded.
*/
const nUiExternal = require('../../browser/js/webpack-entry');
const nUiExternalPoints = nUiExternal(baseConfig.nUiExcludes);

const mainJsWebpackConfig = nWebpack();
mainJsWebpackConfig.entry = modifyEntryKeys(baseConfig.entry, /main\.js$/, name => name.replace(/\.js$/,'-without-n-ui.js'));
mainJsWebpackConfig.externals = nUiExternalPoints;
mainJsWebpackConfig.plugins.push(
	new Wrap(
		'(function(){function init(){\n',
		'\n};window.ftNextnUiLoaded ? init() : document.addEventListener ? document.addEventListener(\'ftNextnUiLoaded\', init) : document.attachEvent(\'onftNextnUiLoaded\', init);})();',
		{ match: /\.js$/ }
	)
);
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

	const appShellWebpackConfig = nWebpack();
	appShellWebpackConfig.entry = {
		'./public/n-ui/es5.js': './bower_components/n-ui/build/deploy/wrapper.js'
	};
	webpackConfigs.push(appShellWebpackConfig)
}

module.exports = webpackConfigs
