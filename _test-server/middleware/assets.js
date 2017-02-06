'use strict';

module.exports = (req, res, next) => {
	res.locals.javascriptBundles = res.locals.javascriptBundles.filter(bundle => {
		return bundle.indexOf('undefined') === -1
	})
	.map(bundle => {
		if (bundle.indexOf('polyfill') > -1) {
			return bundle.replace('polyfill.min', 'polyfill')
				.split('&excludes')[0];
		}
		return bundle;
	});

	next();
}
