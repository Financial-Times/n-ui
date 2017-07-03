// Karma configuration
// Generated on Fri Apr 18 2014 18:19:03 GMT+0100 (BST)

const componentsToTest = [
	'browser',
	'components/n-ui/ads',
	'components/n-ui/tracking',
];

module.exports = function (karma) {

	const config = {
		basePath: '',
		frameworks: ['mocha', 'chai', 'sinon', 'sinon-chai'],
		files: [
			require('./server/lib/asset-manager/polyfill-io')({}).enhanced
		].concat(componentsToTest.map(name => name + '/**/*.spec.js')),
		preprocessors: componentsToTest.reduce((obj, name) => {
			obj[name + '/**/*.spec.js'] = ['webpack', 'sourcemap'];
			return obj;
		}, {}),
		webpack: require('./build/deploy/webpack.deploy.config'),
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
			require('karma-sauce-launcher'),
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
		const nightwatchBrowsers = require('@financial-times/n-heroku-tools/config/nightwatch').test_settings;
		const unstableBrowsers = (process.env.SAUCELABS_UNSTABLE_BROWSERS_JS || '').split(',')
			.concat((process.env.SAUCELABS_UNSTABLE_BROWSERS || '').split(','));
		const whitelistedBrowsers = process.env.SAUCELABS_BROWSERS.split(',');
		const sauceBrowsers = Object.keys(nightwatchBrowsers).reduce((browserList, browserName) => {
			if (browserName === 'default' || unstableBrowsers.indexOf(browserName) > -1 || whitelistedBrowsers.indexOf(browserName) === -1) {
				return browserList;
			}
			browserList[`${browserName}_sauce`] = Object.assign({base: 'SauceLabs'}, nightwatchBrowsers[browserName].desiredCapabilities);
			return browserList;
		}, {});
		config.customLaunchers = sauceBrowsers;
		config.sauceLabs = {
			testName: 'n-ui unit tests',
			username: process.env.SAUCE_USER,
			accessKey: process.env.SAUCE_KEY,
			recordScreenshots: true
		};

		config.browsers = Object.keys(sauceBrowsers);
		config.reporters.push('saucelabs');
	}

	karma.set(config);
};
