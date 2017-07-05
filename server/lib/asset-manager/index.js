const logger = require('@financial-times/n-logger').default;
const path = require('path');
const stylesheetManager = require('./stylesheet-manager');
const messages = require('../messages');
const verifyExistence = require('./verify-existence');
const middlewareFactory = require('./middleware-factory');
const assetUrlGenerator = require('./asset-url-generator');

function init (options, directory, app) {

	// don't start unless all the expected assets are present
	verifyExistence.verify(app.locals);

	// discover stylesheets so they can be inlined and linked to later
	stylesheetManager.init(directory);

	// handle local development
	const useLocalAppShell = process.env.NEXT_APP_SHELL === 'local';
	/* istanbul ignore next */
	if (useLocalAppShell) {
		logger.warn(messages.APP_SHELL_WARNING);
	}

	// make n-ui config for the client side available globally
	try {
		app.locals.nUiConfig = Object.assign({}, require(path.join(directory, 'client/n-ui-config')), {preload: true});
	} catch (e) {
		// TODO turn this on in the next major release
		// throw new Error('error loading n-ui config');
	}

	// initialise helper for calculating paths to assets
	const getAssetUrl = assetUrlGenerator({
		appName: app.locals.__name,
		isProduction: app.locals.__isProduction,
		directory,
		useLocalAppShell
	});

	//expose the asset hashing helper to apps (in case they build non-standard files)
	// TODO deprecate this name in future release
	app.getHashedAssetUrl = getAssetUrl;

	// use all the above in middleware to be used on each request
	app.use(middlewareFactory({
		getAssetUrl,
		stylesheetManager
	}));
}

module.exports = {
	init
};
