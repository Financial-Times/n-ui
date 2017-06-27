/*
This is all the config that is shared amongst an n-ui build as well as an app
build.

If something is required for both, please add it here.
*/

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');
const BowerResolvePlugin = require("bower-resolve-webpack-plugin");

const extractOptions = [{
		loader: 'css-loader',
		options: {
			minimize: true,
			sourceMap: true
		}
	},
	{
		loader: 'postcss-loader',
		options: {
			plugins: () => [
				autoprefixer({
					browsers: ['> 1%', 'last 2 versions', 'ie >= 9', 'ff ESR', 'bb >= 7', 'iOS >= 5'],
					flexbox: 'no-2009'
				})
			]
		}
	},
	{
		loader: 'sass-loader',
		options: {
			sourcemap: true,
			includePaths: [
				path.resolve('./bower_components'),
				path.resolve('./node_modules/@financial-times')
			],
			// NOTE: This line is important for preservation of comments needed by the css-extract-block plugin
			outputStyle: 'expanded'
		}
	}
];

module.exports = {
	// Abort the compilation on first error
	bail: true,

	// Generate source maps
	devtool: 'source-map',

	resolve: {

		plugins: [
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

						// ensures a module reqired multiple times is only transpiled once and
						// is shared by all that use it rather than transpiling it each time
						[ require.resolve('babel-plugin-transform-runtime'),
							{
								helpers: false,
								polyfill: false,
							}
						],

						// This is actually included in the 'es2015' preset but we need to override the
						// `loose` option to be true
						// TODO: stop transform-es2015-classes being loose. loose allows non-spec compliant classes.
						[ require.resolve('babel-plugin-transform-es2015-classes'), { loose: true } ]

						// converts import/export to commonjs, currently not used but
						// will look to include it for browsers that can support modules
						// require('babel-plugin-transform-es2015-modules-commonjs'),
					],
					presets: ['es2015', 'react']
				}
			},
			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract({
					use: extractOptions
				})
			}
		]
	},

	plugins: [
		// moves css out of JS into stylesheets
		new ExtractTextPlugin('[name]'),
	],


	output: {
		filename: '[name]',
		devtoolModuleFilenameTemplate: 'n-ui//[resource-path]?[loaders]'
	}

};
