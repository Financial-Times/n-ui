const path = require('path');
const nWebpack = require('@financial-times/n-webpack');
const fs = require('fs');

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

function constructVariants (nWebpackOptions) {

	// we no longer build a main.js for the app when generating the standard asset variants
	const variants = [
		Object.assign({}, nWebpackOptions, {
			entry: filterEntryKeys(nWebpackOptions.entry, /main\.js$/, true)
		})
	]

	variants.push(Object.assign(clone(nWebpackOptions), {
		language: 'js',
		externals: {'n-ui': true},
		entry: modifyEntryKeys(nWebpackOptions.entry, /main\.js$/, name => name.replace(/\.js$/,'-without-n-ui.js'))
	}))

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

		const appShellBuild = Object.assign(clone(nWebpackOptions), {
			language: 'js',
			env: 'dev',
			withBabelPolyfills: false,
			output: {
				filename: '[name]',
				library: 'ftNextUi',
				devtoolModuleFilenameTemplate: 'n-ui//[resource-path]?[loaders]'
			},
			entry: {},
			exclude: [/node_modules/]
		});

		appShellBuild.entry['./public/n-ui/es5.js'] = './bower_components/n-ui/build/deploy/wrapper.js'
		variants.push(appShellBuild);
	}
	// can't just variants.map(nWebpack) becaue second param truthiness
	return variants.map(conf => nWebpack(conf))
}

const baseConfig = Object.assign({}, {
	withHeadCss: true,
	withHashedAssets: true
}, require(path.join(process.cwd(), 'n-ui-build.config.js')));

module.exports = constructVariants(baseConfig);
