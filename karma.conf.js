const componentsToTest = [
	'browser',
	'components/n-ui/ads',
	'components/n-ui/tracking',
	'components/n-ui/speedcurve-lux'
];

module.exports = function (karma) {

	const config = {
		basePath: '',
		frameworks: ['mocha', 'chai', 'sinon', 'sinon-chai'],
		files: [
			require('./server/lib/asset-manager/polyfill-io').enhanced
		].concat(componentsToTest.map(name => name + '/**/*.spec.js')),
		preprocessors: componentsToTest.reduce((obj, name) => {
			obj[name + '/**/*.spec.js'] = ['webpack', 'sourcemap'];
			return obj;
		}, {}),
		webpack: Object.assign({}, require('./build/webpack.common.config'), {
			devtool: 'inline-source-map'
		}),
		reporters: ['progress'],
		port: 9876,
		colors: true,
		// possible values: karma.LOG_DISABLE || karma.LOG_ERROR || karma.LOG_WARN || karma.LOG_INFO || karma.LOG_DEBUG
		logLevel: karma.LOG_INFO,
		browsers: ['Chrome'],
		plugins: [
			require('karma-mocha'),
			require('karma-chai'),
			require('karma-sinon'),
			require('karma-sinon-chai'),
			require('karma-sourcemap-loader'),
			require('karma-webpack'),
			require('karma-chrome-launcher'),
			require('karma-browserstack-launcher'),
			require('karma-html-reporter')
		],
		client: {
				mocha: {
						reporter: 'html',
						ui: 'bdd',
						timeout: 0
				}
		},
		captureTimeout: (1000 * 60),
		singleRun: true,
		autoWatch: false
	};


	if (process.env.CI) {
		config.browserStack = {
			username: process.env.BROWSERSTACK_USER,
			key: process.env.BROWSERSTACK_KEY
		};

		config.customLaunchers = {
			firefoxLatest: {
				base: 'BrowserStack',
				browser: 'firefox',
				browser_version: 'latest',
				os: 'Windows',
				os_version: '10'
			}

		};

		config.browsers = Object.keys(config.customLaunchers);

		config.reporters.push('browserstack');


	}

	karma.set(config);
};
