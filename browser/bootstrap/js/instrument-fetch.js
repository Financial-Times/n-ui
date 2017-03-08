let theFetch;
export default function (flags, oErrors) {
	theFetch = theFetch || window.fetch;

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
