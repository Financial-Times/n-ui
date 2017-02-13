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
	const hasher = hashedAssets.init(locals);
	nUiManager.init(directory, hasher);


	const useLocalAppShell = process.env.NEXT_APP_SHELL === 'local';

	if (useLocalAppShell) {
		logger.warn(messages.APP_SHELL_WARNING);
	}
	// Attempt to retrieve the json file used to configure n-ui
	let nUiConfig;
	try {
		nUiConfig = Object.assign({}, require(path.join(directory, 'client/n-ui-config')), {preload: true})
	} catch (e) {}


	const stylesheets = stylesheetManager.getStylesheets(options, directory);
	const linkHeader = linkHeaderFactory(hasher);
	const nUiUrlRoot = nUiManager.getUrlRoot(hasher);

	return {
		hasher,
		middleware: (req, res, next) => {

			// This middleware relies on the presence of res.locals.flags.
			// In some scenarios (e.g. using handlebars but not flags) this
			// won't be present
			const flags = res.locals.flags || {};

			// define a helper for adding a link header
			res.linkResource = linkHeader;

			res.locals.stylesheets = stylesheets;

			if (req.accepts('text/html')) {
				res.locals.javascriptBundles = [];
				res.locals.cssBundles = [];
				res.locals.criticalCss = [];
				res.locals.nUiConfig = nUiConfig;

				// work out which assets will be required by the page
				const polyfillRoot = `//${flags.polyfillQA ? 'qa.polyfill.io' : 'next-geebee.ft.com/polyfill'}/v2/polyfill.min.js`;

				res.locals.polyfillCallbackName = nPolyfillIo.callbackName;
				res.locals.polyfillUrls = {
					enhanced: polyfillRoot + nPolyfillIo.getQueryString({enhanced: true}),
					core: polyfillRoot + nPolyfillIo.getQueryString({enhanced: false})
				}

				res.locals.javascriptBundles.push(
					`${nUiUrlRoot}es5${(flags.nUiBundleUnminified || useLocalAppShell ) ? '' : '.min'}.js`,
					hasher.get('main-without-n-ui.js'),
					res.locals.polyfillUrls.enhanced
				);

				// output the default link headers just before rendering
				const originalRender = res.render;

				res.render = function (template, templateData) {

					let cssVariant = templateData.cssVariant || res.locals.cssVariant;
					cssVariant = cssVariant ? `-${cssVariant}` : '';

					// define which css to output in the critical path
					if (options.withHeadCss) {
						if (`head${cssVariant}-n-ui-core` in stylesheets) {
							res.locals.criticalCss.push(stylesheets[`head${cssVariant}-n-ui-core`])
						}
						res.locals.criticalCss.push(stylesheets[`head${cssVariant}`]);
					}

					res.locals.cssBundles.push({
						path: hasher.get(`main${cssVariant}.css`),
						isMain: true,
						isLazy: options.withHeadCss
					});

					res.locals.cssBundles.forEach(file => res.linkResource(file.path, {as: 'style'}));
					res.locals.javascriptBundles.forEach(file => res.linkResource(file, {as: 'script'}));

					if (templateData.withAssetPrecache) {
						res.locals.cssBundles.forEach(file => res.linkResource(file.path, {as: 'style', rel: 'precache'}));
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
