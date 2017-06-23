const logger = require('@financial-times/n-logger').default;
const path = require('path');
const stylesheetManager = require('./stylesheet-manager');
const messages = require('../messages');
const verifyExistence = require('./verify-existence');
const middlewareFactory = require('./middleware-factory');
const assetPathManager = require('./asset-path-manager');

function init (options, directory, app) {

	const refs = { locals: app.locals, app, directory, options }

	// don't start unless all the expected assets are present
	verifyExistence.verify(refs);

	// discover stylesheets so they can be inlined and linked to later
	stylesheetManager.init(refs);
	refs.stylesheetManager = stylesheetManager;

	// handle local development
	refs.useLocalAppShell = process.env.NEXT_APP_SHELL === 'local';
	/* istanbul ignore next */
	if (refs.useLocalAppShell) {
		logger.warn(messages.APP_SHELL_WARNING);
	}

	// make n-ui config for the client side available globally
	try {
		app.locals.nUiConfig = Object.assign({}, require(path.join(directory, 'client/n-ui-config')), {preload: true})
	} catch (e) {}

	// initialise logic to calculate paths to assets
	Object.assign(refs, assetPathManager(app.locals, directory, refs.useLocalAppShell))

	//expose the asset hashing helper to apps (in case they buidl non-standard files)
	app.getHashedAssetUrl = refs.assetHasher;

	// use all the above in middleware to be used on each request
	app.use(middlewareFactory(refs));
}

module.exports = {
	init
}
