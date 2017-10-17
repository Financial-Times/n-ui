/*
This is all the config that is shared amongst an n-ui build as well as an app
build.

If something is required for both, please add it here.
*/
const webpack = require('webpack');
const BowerResolvePlugin = require('bower-resolve-webpack-plugin');

module.exports = {
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

		// In which folders the resolver look for modules relative paths are
		// looked up in every parent folder (like node_modules) absolute
		// paths are looked up directly the order is respected
		modules: [
			'bower_components',
			'node_modules',
		],

		// These JSON files are read in directories
		descriptionFiles: ['bower.json', 'package.json'],

		// These fields in the description files are looked up when trying to resolve the package directory
		mainFields: ['main', 'browser'],

		// These files are tried when trying to resolve a directory
		mainFiles: [
			'index',
			'main'
		],

		// These fields in the description files offer aliasing in this package
		// The content of these fields is an object where requests to a key are mapped to the corresponding value
		aliasFields: ['browser'],

		alias: {
			'react': 'preact-compat',
			'react-dom': 'preact-compat'
		},
	},

	module: {
		rules: [
			//babel
			{
				test: /\.js$/,
				loader: 'babel-loader',
				query: {
					babelrc: false, // ignore any .babelrc in project & dependencies
					cacheDirectory: true,
					plugins: [
						// converts `export default 'foo'` to `exports.default = 'foo'`
						require.resolve('babel-plugin-add-module-exports'),
						// rewrites Promise references to es6-promise, but only if necessary
						require.resolve('babel-plugin-es6-promise'),
						// ensures a module reqired multiple times is only transpiled once and
						// is shared by all that use it rather than transpiling it each time
						[require.resolve('babel-plugin-transform-runtime'),
						{
							helpers: false,
							polyfill: false,
						}
						],
					],
					presets: [
						[
							require.resolve('babel-preset-env'), {
								include: ['transform-es2015-classes'],
								targets: {
									browsers: ['last 2 versions', 'ie >= 11']
								}
							}
						],
						require.resolve('babel-preset-react')
					]
				}
			}
		]
	},

	output: {
		filename: '[name]',
		devtoolModuleFilenameTemplate: 'n-ui//[resource-path]?[loaders]'
	}

};
