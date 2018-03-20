/*
This is all the config that is shared amongst an n-ui build as well as an app
build.

If something is required for both, please add it here.
*/
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const BowerResolvePlugin = require('bower-resolve-webpack-plugin');

const baseConfiguration = {
	bail: true, // Abort the compilation on first error
	devtool: 'source-map', // Generate source maps
	resolve: {
		plugins: [
			new webpack.optimize.ModuleConcatenationPlugin(), // Scope hoisting
			new BowerResolvePlugin() // This will handle a bower.json's `main` property being an array.
		],

		// In which folders the resolver looks for modules:
		//  • Relative paths are looked up in every parent folder (like node_modules).
		//  • Absolute paths are looked up directly (the order is respected).
		modules: ['bower_components', 'node_modules'],

		// These JSON files are read in directories
		descriptionFiles: ['bower.json', 'package.json'],

		// These fields in the description files are looked up when trying to resolve the package directory
		mainFields: ['main', 'browser'],

		// These files are tried when trying to resolve a directory
		mainFiles: ['index', 'main'],

		// These fields in the description files offer aliasing in this package
		// The content of these fields is an object where requests to a key are mapped to the corresponding value
		aliasFields: ['browser']
	},
	output: {
		filename: '[name]'
	}
};

const optionsEs5 = {
	babelrc: false, // ignore any .babelrc in project & dependencies
	cacheDirectory: true,
	plugins: [
		// converts `export default 'foo'` to `exports.default = 'foo'`
		require.resolve('babel-plugin-add-module-exports'),

		// ensures a module reqired multiple times is only transpiled once and
		// is shared by all that use it rather than transpiling it each time
		[
			require.resolve('babel-plugin-transform-runtime'),
			{
				helpers: false,
				polyfill: false
			}
		]
	],
	presets: [
		[
			require.resolve('babel-preset-env'),
			{
				include: [
					'transform-es2015-classes'
				],
				targets: {
					browsers: [
						'last 2 versions',
						'ie >= 11'
					]
				}
			}
		],
		require.resolve('babel-preset-react')
	]
};

const es5Configuration = webpackMerge(baseConfiguration, {
	module: {
		rules: [
			{
				test: /\.ts?$/,
				exclude: [/(node_modules|bower_components)/],
				use: {
					loader: 'ts-loader',
					options: optionsEs5
				},
			},
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: optionsEs5
				},
			}
		]
	}
});

const optionsEs6 = {
	babelrc: false, // ignore any .babelrc in project & dependencies
	cacheDirectory: true,
	presets: [
		['env', {
			modules: false,
			useBuiltIns: true,
			targets: {
				browsers: [
					'Chrome >= 60',
					'Safari >= 10.1',
					'iOS >= 10.3',
					'Firefox >= 54',
					'Edge >= 15',
				],
			},
		}],
	],
};

const es6Configuration = webpackMerge(baseConfiguration, {
	module: {
		rules: [
			{
				test: /\.ts?$/,
				exclude: [/(node_modules|bower_components)/],
				use: {
					loader: 'ts-loader',
					options: optionsEs6
				},
			},
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: optionsEs6
				},
			}
		]
	}
});

module.exports = {
	es5: es5Configuration,
	es6: es6Configuration
};
