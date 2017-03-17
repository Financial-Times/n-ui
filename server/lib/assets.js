const logger = require('@financial-times/n-logger').default;
const path = require('path');
const nPolyfillIo = require('@financial-times/n-polyfill-io');
const nUiManager = require('./n-ui-manager');
const linkHeaderFactory = require('./link-header');
const stylesheetManager = require('./stylesheet-manager');
const messages = require('./messages');
const hashedAssets = require('./hashed-assets');
const verifyAssetsExist = require('./verify-assets-exist');

function init (options, directory, locals) {
	verifyAssetsExist.verify(locals);
	const hasher = hashedAssets.init(locals).get;
	nUiManager.init(directory, hasher);

	const useLocalAppShell = process.env.NEXT_APP_SHELL === 'local';

	/* istanbul ignore next */
	if (useLocalAppShell) {
		logger.warn(messages.APP_SHELL_WARNING);
	}
	// Attempt to retrieve the json file used to configure n-ui
	let nUiConfig;
	try {
		nUiConfig = Object.assign({}, require(path.join(directory, 'client/n-ui-config')), {preload: true})
	} catch (e) {}

	stylesheetManager.init(options, directory);
	const linkHeader = linkHeaderFactory(hasher);
	const nUiUrlRoot = nUiManager.getUrlRoot(hasher);

	const getStylesheetPath = stylesheetName => {
		return /n-ui/.test(stylesheetName) ? `${nUiUrlRoot}${stylesheetName}.css` : hasher(`${stylesheetName}.css`)
	}

	return {
		hasher,
		middleware: (req, res, next) => {

			// This middleware relies on the presence of res.locals.flags.
			// In some scenarios (e.g. using handlebars but not flags) this
			// won't be present
			const flags = res.locals.flags || {};

			// define a helper for adding a link header
			res.linkResource = linkHeader;

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

				let polyfillRoot;
				/* istanbul ignore if */
				if (flags.polyfillQA) {
					polyfillRoot = 'https://qa.polyfill.io/v2/polyfill.min.js';
				} else if (flags.polyfillSameDomain) {
					polyfillRoot = 'https://www.ft.com/__origami/service/polyfill/v2/polyfill.min.js';
				} else {
					polyfillRoot = 'https://next-geebee.ft.com/polyfill/v2/polyfill.min.js';
				}


				res.locals.polyfillCallbackName = nPolyfillIo.callbackName;
				res.locals.polyfillUrls = {
					enhanced: polyfillRoot + nPolyfillIo.getQueryString({enhanced: true}),
					core: polyfillRoot + nPolyfillIo.getQueryString({enhanced: false})
				}

				res.locals.javascriptBundles.push(
					`${nUiUrlRoot}es5${(flags.nUiBundleUnminified || useLocalAppShell ) ? '' : '.min'}.js`,
					hasher('main-without-n-ui.js'),
					res.locals.polyfillUrls.enhanced
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
}

module.exports = {
	init
}
