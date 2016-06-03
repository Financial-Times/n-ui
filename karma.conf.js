// Karma configuration
// Generated on Fri Apr 18 2014 18:19:03 GMT+0100 (BST)

const path = require('path');
const BowerWebpackPlugin = require('bower-webpack-plugin');
const componentsToTest = [
	'layout',
	'ads',
	'tracking'
]

module.exports = function (config) {


	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'chai', 'sinon', 'sinon-chai'],

		// list of files / patterns to load in the browser
		files: [
			'http://cdn.polyfill.io/v2/polyfill.min.js?features=' + [
				'default',
				'requestAnimationFrame',
				'Promise',
				'matchMedia',
				'HTMLPictureElement',
				// the following polyfills are included pending https://github.com/Financial-Times/polyfill-service/issues/653
				'CustomEvent|always|gated',
				'fetch|always|gated',
				'Array.prototype.find|always|gated',
				'Array.prototype.findIndex|always|gated'
			].join(',') + '&excludes=Symbol,Symbol.iterator,Symbol.species,Map,Set'
		].concat(componentsToTest.map(name => name + '/test/*.spec.js')),

		// preprocess matching files before serving them to  the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: componentsToTest.reduce((obj, name) => {
			obj[name + '/test/*.spec.js'] = ['webpack', 'sourcemap']
			return obj;
		}, {}),
		webpack: {
			module: {
				loaders: [
					{
						test: /\.js$/,
						loader: 'babel',
						query: {
							cacheDirectory: true,
							presets: ['es2015'],
							plugins: ['add-module-exports', ['transform-es2015-classes', { loose: true }]]
						}
					},
					// don't use requireText plugin (use the 'raw' plugin)
					{
						test: /follow-email\.js$/,
						loader: 'imports?requireText=>require'
					},
					// set 'this' scope to window
					{
						test: /cssrelpreload\.js$/,
						loader: 'imports-loader?this=>window'
					},
				]
			},
			plugins: [
				new BowerWebpackPlugin({ includes: /\.js$/ }),
			],
			resolve: {
				root: [
					path.join(__dirname, 'bower_components'),
					path.join(__dirname, 'node_modules')
				]
			}
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Chrome'],

		plugins: [
			require("karma-mocha"),
			require("karma-chai"),
			require("karma-sinon"),
			require("karma-sinon-chai"),
			require("karma-sourcemap-loader"),
			require("karma-webpack"),
			require("karma-firefox-launcher"),
			require("karma-chrome-launcher"),
			require("karma-html-reporter")
		],
		client: {
				mocha: {
						reporter: 'html',
						ui: 'bdd',
						timeout: 0
				}
		},

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true
	});
};
