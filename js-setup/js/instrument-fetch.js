let theFetch;
export default function (flags) {
	theFetch = theFetch || window.fetch;
	// allow use of our proxy for apis when cors not available
	if (!('withCredentials' in new XMLHttpRequest())) {
		const realFetch = window.fetch;

		window.fetch = function (url, opts) {
			if (opts.useCorsProxy) {
				const urlObj = new URL(url);
				opts.headers = opts.headers || {};
				opts.headers['api-host'] = urlObj.origin;
				url = url.replace(urlObj.origin, '/__api-proxy')
			}
			return realFetch.call(this, url, opts)
		};
	}

	// turn on more detailed error reporting of ajax calls
	if (flags.get('clientAjaxErrorReporting')) {
		const realFetch = window.fetch;
		window.fetch = function (url, opts) {
			return realFetch.call(this, url, opts)
				.catch(function (err) {
					oErrors.log(url + (opts ? JSON.stringify(opts) : '' ) + err);
					throw err;
				});
		};
	}

}

export function restore () {
	if (theFetch) {
		window.fetch = theFetch;
	}
}
