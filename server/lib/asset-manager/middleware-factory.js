const polyfillIo = require('./polyfill-io');

module.exports = ({
	getAssetUrl,
	useLocalAppShell,
	stylesheetManager,
	linkHeaderHelper
}) => {

	return (req, res, next) => {

		// define a helper for adding a link header
		res.locals.resourceHints = {
			highest: [],
			normal: []
		};
		res.linkResource = linkHeaderHelper;

		if (req.accepts('text/html')) {
			res.locals.javascriptBundles = [];
			res.locals.stylesheets = {
				inline: [],
				lazy: [],
				blocking: []
			};

			res.locals.stylesheets.inline = ['head'];
			res.locals.stylesheets.lazy = ['main'];

			res.locals.polyfillIo = polyfillIo(res.locals.flags);

			res.locals.javascriptBundles.push(
				res.locals.polyfillIo.enhanced,
				getAssetUrl({
					file: 'font-loader.min.js',
					isNUi: true
				}),
				getAssetUrl({
					file: `es5${(res.locals.flags.nUiBundleUnminified || useLocalAppShell ) ? '' : '.min'}.js`,
					flags: res.locals.flags,
					isNUi: true
				}),
				getAssetUrl({
					file: 'o-errors/.min.js',
					isNUi: true
				}),
				getAssetUrl('main-without-n-ui.js')
			);


			res.locals.javascriptBundles.push();

			// output the default link headers just before rendering
			const originalRender = res.render;

			res.render = function (template, templateData) {
				// Add standard n-ui stylesheets
				res.locals.stylesheets.inline.unshift('head-n-ui-core');
				// For now keep building n-ui-core in the main app stylesheet
				// res.locals.stylesheets.lazy.unshift('n-ui-core');

				res.locals.stylesheets.inline = stylesheetManager.concatenateStyles(res.locals.stylesheets.inline);

				// TODO collect metrics on this similar to inline stylesheets
				res.locals.stylesheets.lazy = res.locals.stylesheets.lazy
					.map(name => getAssetUrl(stylesheetManager.nameToUrlConfig(name)));
				res.locals.stylesheets.blocking = res.locals.stylesheets.blocking
					.map(name => getAssetUrl(stylesheetManager.nameToUrlConfig(name)));

				res.locals.stylesheets.lazy.forEach(file => res.linkResource(file, { as: 'style' }, { priority: 'highest' }));
				res.locals.stylesheets.blocking.forEach(file => res.linkResource(file, { as: 'style' }, { priority: 'highest' }));
				res.locals.javascriptBundles.forEach(file => res.linkResource(file, { as: 'script' }, { priority: 'highest' }));

				// TODO make this a setting on the app - template data feels like a messy place
				if (templateData.withAssetPrecache) {
					res.locals.stylesheets.lazy.forEach(file => res.linkResource(file, {as: 'style', rel: 'precache'}));
					res.locals.stylesheets.blocking.forEach(file => res.linkResource(file, {as: 'style', rel: 'precache'}));
					res.locals.javascriptBundles.forEach(file => res.linkResource(file, {as: 'script', rel: 'precache'}));
				}
				// supercharge the masthead image
				res.linkResource(
					'https://www.ft.com/__origami/service/image/v2/images/raw/ftlogo:brand-ft-masthead?source=o-header&tint=%23333333,%23333333&format=svg',
					{ as: 'image' },
					{ priority: 'highest' }
				);

				res.append('Link', this.locals.resourceHints.highest);
				res.append('Link', this.locals.resourceHints.normal);

				return originalRender.apply(res, [].slice.call(arguments));
			};
		}

		next();
	};
};
