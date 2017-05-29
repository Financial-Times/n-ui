const path = require('path');
const nWebpack = require('@financial-times/n-webpack');
const fs = require('fs');
const join = require('path').join;
const Wrap = require('../lib/addons/wrap');
const headCss = require('../lib/head-css')

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

function clone (obj) {
	return JSON.parse(JSON.stringify(obj));
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

// we no longer build a main.js for the app when generating the standard asset variants
const variants = [
	// all entry points excluding main.js generated as normal
	headCss(nWebpack(Object.assign({}, baseConfig, {
		entry: filterEntryKeys(baseConfig.entry, /main\.js$/, true)
	})))
]

// new entry point for main.js declaring external n-ui
const mainJs = nWebpack(Object.assign(clone(baseConfig), {
	language: 'js',
	entry: modifyEntryKeys(baseConfig.entry, /main\.js$/, name => name.replace(/\.js$/,'-without-n-ui.js'))
}))

const nUiEntry = path.join(process.cwd(), 'bower_components/n-ui/browser/js/webpack-entry');
const nUiEntryPoints = require(nUiEntry)(baseConfig.nUiExcludes)
mainJs.externals = Object.assign({}, mainJs.externals, nUiEntryPoints);
mainJs.plugins.push(
	new Wrap(
		'(function(){function init(){\n',
		'\n};window.ftNextnUiLoaded ? init() : document.addEventListener ? document.addEventListener(\'ftNextnUiLoaded\', init) : document.attachEvent(\'onftNextnUiLoaded\', init);})();',
		{ match: /\.js$/ }
	)
);

variants.push(mainJs);

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

	const appShellBuild = Object.assign(clone(baseConfig), {
		language: 'js',
		env: 'dev',
		withBabelPolyfills: false,
		output: {
			filename: '[name]',
			library: 'ftNextUi',
			devtoolModuleFilenameTemplate: 'n-ui//[resource-path]?[loaders]'
		},
		entry: {
			'./public/n-ui/es5.js': './bower_components/n-ui/build/deploy/wrapper.js'
		},
		exclude: [/node_modules/]
	});

	variants.push(nWebpack(appShellBuild));
}

module.exports = variants
