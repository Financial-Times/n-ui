/*
This is just porting all the configs from all the seperate transform files and
having one large standard one. This should make it easier to update to webpack 2
As well as just making it more accessible without having to dive around all the
transforms. Would prefer to have a well commented file like Origami:
*/

const path = require('path');
const glob = require('glob');
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
]

module.exports = {
	devtool: 'source-map',

	resolve: {
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
			'main',
			'src/main-client' /* HACK: this is becaause of n-image's entrypoin not being main.js or index.js */
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
				test: /\.html$/,
				loader: 'handlebars-loader',
				options: handlebarsConfig()
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
		new ExtractTextPlugin('[name]'),
	],

	output: {
		filename: '[name]',
		devtoolModuleFilenameTemplate: 'n-ui//[resource-path]?[loaders]'
	}
};
