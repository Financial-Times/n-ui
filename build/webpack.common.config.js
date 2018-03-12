/*
This is all the config that is shared amongst an n-ui build as well as an app
build.

If something is required for both, please add it here.
*/
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const BowerResolvePlugin = require('bower-resolve-webpack-plugin');

// Common babel config
const babelLoaderConfig = {
	loader: 'babel-loader',
	options: {
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
					include: ['transform-es2015-classes'],
					targets: {
						browsers: ['last 2 versions', 'ie >= 11']
					}
				}
			],
			require.resolve('babel-preset-react')
		]
	}
};

const baseConfiguration = {

	// Abort the compilation on first error
	bail: true,

	// Generate source maps
	devtool: 'source-map',

	resolve: {
		plugins: [
			// Scope hoisting
			new webpack.optimize.ModuleConcatenationPlugin(),
			// This will handle a bower.json's `main` property being an array.
			new BowerResolvePlugin()
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

const es5Configuration = webpackMerge(baseConfiguration, {
	module: {
		rules: [
			// typescript
			{
				test: /\.ts?$/,
				exclude: [/(node_modules|bower_components)/],
				use: [
					babelLoaderConfig,
					{
						loader: 'ts-loader'
					}
				]
			},
			//babel
			{
				test: /\.js$/,
				use: [
					babelLoaderConfig
				]
			}
		]
	}
});

const es6Configuration = webpackMerge(baseConfiguration, {
	module: {
		rules: [
			// typescript
			{
				test: /\.ts?$/,
				exclude: [/(node_modules|bower_components)/],
				use: [
					{
						loader: 'ts-loader'
					}
				]
			}
		]
	}
});

module.exports = {
	es5: es5Configuration,
	es6: es6Configuration
};
