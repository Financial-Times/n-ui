const oErrors = require('o-errors');

const appInfo = {
	isProduction: document.documentElement.hasAttribute('data-next-is-production'),
	version: document.documentElement.getAttribute('data-next-version'),
	name: document.documentElement.getAttribute('data-next-app')
};

oErrors.init({
	enabled: window.nextFeatureFlags.clientErrorReporting && appInfo.isProduction,
	sentryEndpoint: 'https://62a990fd8dce4a27aafb006b58783f66@sentry.io/195030',
	siteVersion: appInfo.version,
	logLevel: window.nextFeatureFlags.clientDetailedErrorReporting ? 'contextonly' : 'off',
	tags: {
		appName: appInfo.name
	},
	errorBuffer: window.errorBuffer || []
});

// turn on more detailed error reporting of ajax calls
if (window.nextFeatureFlags.clientAjaxErrorReporting) {
	const realFetch = window.fetch;
	window.fetch = function (url, opts) {
		return realFetch.call(this, url, opts)
			.catch(function (err) {
				oErrors.log(url + (opts ? JSON.stringify(opts) : '' ) + err);
				throw err;
			});
	};
}
