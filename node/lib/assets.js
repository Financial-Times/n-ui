const logger = require('@financial-times/n-logger').default;
const path = require('path');
const nPolyfillIo = require('@financial-times/n-polyfill-io');
const nUiManager = require('./n-ui-manager');
const linkHeaderFactory = require('./link-header');
const stylesheetManager = require('./stylesheet-manager');
const messages = require('./messages');
const nEagerFetch = require('n-eager-fetch');
const ratRace = require('promise-rat-race');
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

	const getStylesheetPath = stylesheetName => {
		return /n-ui/.test(stylesheetName) ? `${nUiUrlRoot}${stylesheetName}.css` : hasher(`${stylesheetName}.css`)
	}

	return {
		hasher,
		fetchNUiCss: () => {
			if (process.env.LOCAL_APP_SHELL === 'local') {
				return Promise.resolve();
			}
			return ratRace(
				[
					'https:' + nUiUrlRoot,
					nUiUrlRoot.replace('//www.ft.com', 'http://ft-next-n-ui-prod.s3-website-eu-west-1.amazonaws.com'),
					nUiUrlRoot.replace('//www.ft.com', 'http://ft-next-n-ui-prod-us.s3-website-us-east-1.amazonaws.com')
				]
					.map(urlRoot =>
						nEagerFetch(`${urlRoot}head-n-ui-core.css`, {retry: 3})
							.then(res => {
								if (res.ok) {
									return res.text();
								}
								throw new Error('Failed to fetch n-ui stylesheet');
							})
							.then(text => {
								// if it's an empty string, something probably went wrong
								if (!text.length) {
									throw new Error('Fetched empty n-ui stylesheet');
								}
								return text;
							})
					)
			)
				.then(text => stylesheets['head-n-ui-core'] = text)
				.then(() => logger.warn({
					event: 'N_UI_CSS_FETCH_SUCCESS',
					message: 'head-n-ui-core.css successfully retrieved from s3'
				}))
				.catch(err => {
					logger.error('event=N_UI_CSS_FETCH_FAILURE', err)
					// TODO
					// for now we catch the error as the app builds the css anyway
					// After it's been in prod a while the plan is to stop building the css in every app
					// Then the error will need to be rethrown so the app fails to start
					// throw err;
				})
				.then(() => stylesheets);
		},
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
				res.locals.cssBundles = {
					inline: [],
					lazy: [],
					blocking: []
				};

				res.locals.cssBundles.inline = ['head']
				res.locals.cssBundles.lazy = ['main']
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

					// Add standard n-ui stylesheets
					res.locals.cssBundles.inline.unshift('head-n-ui-core');
					res.locals.cssBundles.lazy.unshift('n-ui-core');

					res.locals.cssBundles.inline = res.locals.cssBundles.inline.reduce((str, name) => {
						if (!stylesheets[name]) {
							throw `Stylesheet ${name} does not exist`;
						}
						return str + stylesheets[name];
					}, '');

					res.locals.cssBundles.lazy = res.locals.cssBundles.lazy.map(getStylesheetPath);
					res.locals.cssBundles.blocking = res.locals.cssBundles.blocking.map(getStylesheetPath);

					res.locals.cssBundles.lazy.forEach(file => res.linkResource(file.path, {as: 'style'}));
					res.locals.cssBundles.blocking.forEach(file => res.linkResource(file.path, {as: 'style'}));
					res.locals.javascriptBundles.forEach(file => res.linkResource(file, {as: 'script'}));

					if (templateData.withAssetPrecache) {
						res.locals.cssBundles.lazy.forEach(file => res.linkResource(file.path, {as: 'style', rel: 'precache'}));
						res.locals.cssBundles.blocking.forEach(file => res.linkResource(file.path, {as: 'style', rel: 'precache'}));
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
