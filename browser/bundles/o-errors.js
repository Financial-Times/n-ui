(function(){
	function init () {

		const oErrors = require('o-errors');

		const appInfo = {
			isProduction: document.documentElement.hasAttribute('data-next-is-production'),
			version: document.documentElement.getAttribute('data-next-version'),
			name: document.documentElement.getAttribute('data-next-app')
		};

		oErrors.init({
			enabled: window.nextFeatureFlags.clientErrorReporting && this.appInfo.isProduction,
			sentryEndpoint: 'https://edb56e86be2446eda092e69732d8654b@sentry.io/32594',
			siteVersion: this.appInfo.version,
			logLevel: window.nextFeatureFlags.clientDetailedErrorReporting ? 'contextonly' : 'off',
			tags: {
				appName: this.appInfo.name
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

	};

	window.ftNextPolyfillLoaded ? init() : document.addEventListener('ftNextPolyfillLoaded', init);
})();



