const logger = require('@financial-times/n-logger').default;
const path = require('path');
const polyfillIo = require('./polyfill-io');
const nUiManager = require('./n-ui-manager');
const linkHeaderFactory = require('./link-header');
const stylesheetManager = require('./stylesheet-manager');
const messages = require('./messages');
const hashedAssets = require('./hashed-assets');
const verifyAssetsExist = require('./verify-assets-exist');

function init (options, directory, app) {

	// const refs = { locals }
	const locals = app.locals;

	// don't start unless all the expected assets are present
	verifyAssetsExist.verify(locals);

	// discover stylesheets so they can be inlined and linked to later
	stylesheetManager.init(options, directory);

	// initialise asset hashing
	const assetHasher = hashedAssets.init(locals).get;
	app.getHashedAssetUrl = assetHasher;

	// create the link header helper
	const linkHeader = linkHeaderFactory(assetHasher);

	// handle local development
	const useLocalAppShell = process.env.NEXT_APP_SHELL === 'local';
	/* istanbul ignore next */
	if (useLocalAppShell) {
		logger.warn(messages.APP_SHELL_WARNING);
	}

	// Set up n-ui
	nUiManager.init(directory, assetHasher);
	let nUiConfig;
	try {
		nUiConfig = Object.assign({}, require(path.join(directory, 'client/n-ui-config')), {preload: true})
	} catch (e) {}
	const nUiUrlRoot = nUiManager.getUrlRoot(assetHasher);

	// helper to build stylesheet paths
	const getStylesheetPath = stylesheetName => {
		return /n-ui/.test(stylesheetName) ? `${nUiUrlRoot}${stylesheetName}.css` : assetHasher(`${stylesheetName}.css`)
	}

	const	middleware = (req, res, next) => {

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
			if (res.locals.flags.polyfillQA) {
				polyfillRoot = 'https://qa.polyfill.io/v2/polyfill.min.js';
			} else {
				polyfillRoot = 'https://www.ft.com/__origami/service/polyfill/v2/polyfill.min.js';
			}


			res.locals.polyfillCallbackName = polyfillIo.callbackName;
			res.locals.polyfillUrls = {
				enhanced: polyfillRoot + polyfillIo.getQueryString('enhanced'),
				core: polyfillRoot + polyfillIo.getQueryString('core')
			}

			res.locals.javascriptBundles.push(
				`${nUiUrlRoot}es5${(res.locals.flags.nUiBundleUnminified || useLocalAppShell ) ? '' : '.min'}.js`,
				assetHasher('main-without-n-ui.js'),
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


	app.use(middleware);
}

module.exports = {
	init
}
