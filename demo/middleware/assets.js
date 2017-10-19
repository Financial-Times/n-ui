'use strict';

module.exports = (req, res, next) => {
	res.locals.javascriptBundles = res.locals.javascriptBundles
		.filter(bundle => {
			return bundle && bundle.file.indexOf('undefined') === -1;
		})
		.map(bundle => {
			if (bundle.file.indexOf('polyfill') > -1) {
				bundle.file = bundle.file.replace('polyfill.min', 'polyfill')
					.split('&excludes')[0];
			}
		});
	// no head.css generated in this demo app
	res.locals.stylesheets.inline = [];
	next();
};
