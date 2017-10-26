const oErrors = require('o-errors');

const appInfo = {
	isProduction: document.documentElement.hasAttribute('data-next-is-production'),
	version: document.documentElement.getAttribute('data-next-version'),
	name: document.documentElement.getAttribute('data-next-app')
};

oErrors.init({
	enabled: window.FT.flags.clientErrorReporting && appInfo.isProduction,
	sentryEndpoint: 'https://62a990fd8dce4a27aafb006b58783f66@sentry.io/195030',
	siteVersion: appInfo.version,
	logLevel: window.FT.flags.clientDetailedErrorReporting ? 'contextonly' : 'off',
	tags: {
		appName: appInfo.name
	},
	filterError: function () {
		return !window.FT.disableOErrors;
	},
	errorBuffer: window.errorBuffer || []
});


(function () {
	// Cors errors are so uninformative. This forces them to be a bit more informative
	const realFetch = window.fetch;
	window.fetch = function (url, opts) {
		return realFetch.call(this, url, opts)
			.catch(function (err) {
				if (err.message === 'Failed to fetch') {
					throw new TypeError(`Cors error when fetching ${url.replace(/\/sessions\/s\/.*/, '/sessions/s/{sessionToken}')}`);
				}
				throw err;
			});
	};
}());

// turn on more detailed error reporting of ajax calls
if (window.FT.flags.clientAjaxErrorReporting) {
	(function () {
		const realFetch = window.fetch;
		window.fetch = function (url, opts) {
			return realFetch.call(this, url, opts)
				.catch(function (err) {
					oErrors.log(url + (opts ? JSON.stringify(opts) : '' ) + err);
					throw err;
				});
		};
	}());
}
