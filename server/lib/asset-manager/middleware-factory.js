const polyfillIo = require('./polyfill-io');

module.exports = ({ linkHeaderHelper, nUiConfig, nUiUrlRoot, useLocalAppShell, assetHasher, stylesheetManager}) => {
	// helper to build stylesheet paths
	const getStylesheetPath = stylesheetName => {
		return /n-ui/.test(stylesheetName) ? `${nUiUrlRoot}${stylesheetName}.css` : assetHasher(`${stylesheetName}.css`)
	}

	return (req, res, next) => {

		// define a helper for adding a link header
		res.linkResource = linkHeaderHelper;
		if (req.accepts('text/html')) {
			res.locals.javascriptBundles = [];
			res.locals.stylesheets = {
				inline: [],
				lazy: [],
				blocking: []
			};

			res.locals.stylesheets.inline = ['head']
			res.locals.stylesheets.lazy = ['main']
			res.locals.nUiConfig = nUiConfig;

			// work out which assets will be required by the page

			res.locals.polyfillIo = polyfillIo(res.locals.flags);

			res.locals.javascriptBundles.push(
				`${nUiUrlRoot}es5${(res.locals.flags.nUiBundleUnminified || useLocalAppShell ) ? '' : '.min'}.js`,
				assetHasher('main-without-n-ui.js'),
				res.locals.polyfillIo.enhanced
			);


			// output the default link headers just before rendering
			const originalRender = res.render;

			res.render = function (template, templateData) {
				res.linkResource('https://www.ft.com/__origami/service/image/v2/images/raw/ftlogo:brand-ft-masthead?source=o-header&tint=%23333333,%23333333&format=svg', {as: 'image'});
				// Add standard n-ui stylesheets
				res.locals.stylesheets.inline.unshift('head-n-ui-core');
				// For now keep building n-ui-core in the main app stylesheet
				// res.locals.stylesheets.lazy.unshift('n-ui-core');

				res.locals.stylesheets.inline = stylesheetManager.concatenateStyles(res.locals.stylesheets.inline);

				// TODO: DRY this out
				res.locals.stylesheets.lazy = res.locals.stylesheets.lazy.map(getStylesheetPath);
				res.locals.stylesheets.blocking = res.locals.stylesheets.blocking.map(getStylesheetPath);

				res.locals.stylesheets.lazy.forEach(file => res.linkResource(file, {as: 'style'}));
				res.locals.stylesheets.blocking.forEach(file => res.linkResource(file, {as: 'style'}));
				res.locals.javascriptBundles.forEach(file => res.linkResource(file, {as: 'script'}));

				if (templateData.withAssetPrecache) {
					res.locals.stylesheets.lazy.forEach(file => res.linkResource(file, {as: 'style', rel: 'precache'}));
					res.locals.stylesheets.blocking.forEach(file => res.linkResource(file, {as: 'style', rel: 'precache'}));
					res.locals.javascriptBundles.forEach(file => res.linkResource(file, {as: 'script', rel: 'precache'}));
				}

				return originalRender.apply(res, [].slice.call(arguments));
			}
		}

		next();
	}
}
