/*
This is just porting all the configs from all the seperate transform files and
having one large standard one. This should make it easier to update to webpack 2
As well as just making it more accessible without having to dive around all the
transforms. Would prefer to have a well commented file like Origami:
*/

const path = require('path');
const glob = require('glob');
// const BowerWebpackPlugin = require('bower-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');


const handlebarsConfig = () => {
	const extraHelperDirs = glob.sync('**/node_modules/@financial-times/**/handlebars-helpers')
		.map(dir => path.resolve(dir));
	return {
		debug: false, // set to true to debug finding partial/helper issues
		extensions: ['.html'],
		helperDirs: [
			path.resolve('./node_modules/@financial-times/n-handlebars/src/helpers'),
			path.resolve('./server/helpers'),
			path.resolve('./bower_components/n-concept/handlebars-helpers')
		].concat(extraHelperDirs),
		partialDirs: [
			path.resolve('./bower_components'),
			path.resolve('./node_modules/@financial-times'),
			path.resolve('./views/universal')
		]
	};
};

const extractOptions = [
		{
			loader: 'css-loader',
			options: {
				minimize: process.argv.includes('--dev') ? false : true,
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
	]

module.exports = function () {
	return {
		devtool: 'source-map',

		resolve: {
			modules: [
				path.resolve('./bower_components'),
				path.resolve('./node_modules'),
				// 'bower_components',
				// 'node_modules',
			],
			// These JSON files are read in directories
			descriptionFiles: [ 'bower.json', 'package.json'],

			// These fields in the description files are looked up when trying to resolve the package directory
			mainFields: ['main', 'browser'],

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

			alias: Object.assign(require('babel-polyfill-silencer/aliases'), {
				'react': 'preact-compat',
				'react-dom': 'preact-compat'
			}),
		},

		module: {
			rules: [
				//babel
				{
					test: /\.js$/,
					loader: require.resolve('babel-loader'),
					include: [
						/bower_components/,
						path.resolve('./node_modules/@financial-times/n-handlebars/src/helpers'),
						path.resolve('./server/helpers'), // more handlebars helpers
						path.resolve('./client'),
						path.resolve('./config'),
						path.resolve('./shared'),
						/@financial-times\/n-card/,
						/@financial-times\/n-email-article/,
						/@financial-times\/n-image/,
						/@financial-times\/n-myft-ui/,
						/@financial-times\/n-notification/,
						/@financial-times\/n-section/,
						/@financial-times\/n-ui/,
						/@financial-times\/n-teaser/,
						/@financial-times\/n-counter-ad-blocking/,
						/@financial-times\/n-native-ads/,
						/@financial-times\/n-tourtip/,
						/.*/
					],
					exclude: [
						/node_modules/
					],
					query: {
						babelrc: false, // ignore any .babelrc in project & dependencies
						cacheDirectory: true,
						plugins: [
							require.resolve('babel-plugin-add-module-exports', true),
							[
								require.resolve('babel-plugin-transform-runtime'),
								{ polyfill: false }
							],
							// require.resolve('babel-plugin-transform-es2015-modules-commonjs'), // not sure this was ever actually used??
							[
								require.resolve('babel-plugin-transform-es2015-classes'),
								{ loose: true }
							]
						],
						presets: [
							require.resolve('babel-preset-react'),
							require.resolve('babel-preset-es2015')
						]
					},
					// compact: process.argv.includes('--dev') ? false : true // not sure this was ever actually used??

				},
				//base-js
				// don't use requireText plugin (use the 'raw' plugin)
				{
					test: /follow-email\.js$/,
					loader: require.resolve('imports-loader'),
					query: 'requireText=>require'
				},
				{
					test: /\.html$/,
					loader: 'handlebars',
					options: handlebarsConfig()
				},
				// base-scss
				// set 'this' scope to window
				{
					test: /cssrelpreload\.js$/,
					loader: require.resolve('imports-loader'),
					query: 'this=>window'
				},
				{
					test: /\.scss$/,
					loader: ExtractTextPlugin.extract({
						use: extractOptions
					})
				}
			]
		},

		// sassLoader: {
		// 	sourcemap: true,
		// 	includePaths: [
		// 		path.resolve('./bower_components'),
		// 		path.resolve('./node_modules/@financial-times')
		// 	],
		// 	// NOTE: This line is important for preservation of comments needed by the css-extract-block plugin
		// 	outputStyle: 'expanded'
		// },
		//
		// postcss: () => {
		// 	return [ autoprefixer({
		// 		browsers: ['> 1%', 'last 2 versions', 'ie >= 9', 'ff ESR', 'bb >= 7', 'iOS >= 5'],
		// 		flexbox: 'no-2009'
		// 	}) ];
		// },

		plugins: [
			// new BowerWebpackPlugin({
			// 	includes: /\.js$/,
			// 	modulesDirectories: path.resolve('./bower_components')
			// }),
			new ExtractTextPlugin('[name]'),


		],

		resolveLoader: {
			alias: {
				raw: 'raw-loader',
				imports: 'imports-loader',
				postcss: 'postcss-loader',
				sass: 'sass-loader',
			}
		},

		output: {
			filename: '[name]',
			library: 'ftNextUi',
			devtoolModuleFilenameTemplate: 'n-ui//[resource-path]?[loaders]'
		}
	};

}
