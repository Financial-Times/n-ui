/*
This is the webpack config for the pre built n-ui assets.
*/

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ExtractCssBlockPlugin = require('extract-css-block-webpack-plugin');
const autoprefixer = require('autoprefixer');

const extractOptions = [
	{
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

			// An array of paths that LibSass can look in to attempt to resolve your @import declarations
			includePaths: [ './bower_components' ],

			// Determines the output format of the final CSS style.
			// NOTE: This line is important for preservation of comments needed by the css-extract-block plugin
			outputStyle: 'expanded'
		}
	}
]

module.exports = function () {
	return {
		// Abort the compilation on first error
		bail: true,

		// Generate source maps
		devtool: 'source-map',

		entry: {
			'./dist/assets/es5.js': './build/deploy/wrapper.js',
			'./dist/assets/es5.min.js': './build/deploy/wrapper.js',
			'./dist/assets/n-ui-core.css': './build/deploy/shared-head.scss',
		},

		resolve: {
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
			mainFields: ['main'],

			// These files are tried when trying to resolve a directory
			mainFiles: [
				'index',
				'main',
				'src/main-client' /* HACK: this is becaause of n-image's entrypoin not being main.js or index.js */
			],

			// These fields in the description files offer aliasing in this package
			// The content of these fields is an object where requests to a key are mapped to the corresponding value
			aliasFields: ['browser'],

			// These extensions are tried when resolving a file
			extensions: ['.js', '.json'],

			// any references made to react or react-dom, use preact-compat instead
			alias: {
				'react': 'preact-compat',
				'react-dom': 'preact-compat'
			},
		},

		module: {
			rules: [
				{
					test: /\.js$/,
					use: {
						loader: 'babel-loader',
						options: {
							// ignore any .babelrc in project & dependencies
							babelrc: false,
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

			// splits one stylesheet into multiple stylesheets based on nUiStylesheetStart/End comments
			new ExtractCssBlockPlugin(),

			// replace any instances of `process.env.NODE_ENV` with `'production'`
			// new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }), // Only production

			// Minify & Uglify all the JS
			new webpack.optimize.UglifyJsPlugin({
				test: /\.min\.js$/,
				sourceMap: true
			}),
		],

		output: {
			filename: '[name]',
			devtoolModuleFilenameTemplate: 'n-ui//[resource-path]?[loaders]'
		}
	};

}
