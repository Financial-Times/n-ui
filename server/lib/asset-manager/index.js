const logger = require('@financial-times/n-logger').default;
const path = require('path');
const nUiManager = require('./n-ui-manager');
const linkHeaderHelperFactory = require('./link-header-helper-factory');
const stylesheetManager = require('./stylesheet-manager');
const messages = require('../messages');
const hashedAssets = require('./hashed-assets');
const verifyExistence = require('./verify-existence');
const middlewareFactory = require('./middleware-factory');

function init (options, directory, app) {

	const refs = { locals: app.locals, app, directory, options }

	// don't start unless all the expected assets are present
	verifyExistence.verify(refs);

	// discover stylesheets so they can be inlined and linked to later
	stylesheetManager.init(refs);
	refs.stylesheetManager = stylesheetManager;

	// initialise asset hashing
	const assetHasher = hashedAssets.init(refs).get;
	app.getHashedAssetUrl = assetHasher;
	refs.assetHasher = assetHasher

	// create the link header helper
	const linkHeaderHelper = linkHeaderHelperFactory(refs);
	refs.linkHeaderHelper = linkHeaderHelper;

	// handle local development
	refs.useLocalAppShell = process.env.NEXT_APP_SHELL === 'local';
	/* istanbul ignore next */
	if (refs.useLocalAppShell) {
		logger.warn(messages.APP_SHELL_WARNING);
	}

	// Set up n-ui
	nUiManager.init(refs);
	try {
		refs.nUiConfig = Object.assign({}, require(path.join(directory, 'client/n-ui-config')), {preload: true})
	} catch (e) {}
	refs.nUiUrlRoot = nUiManager.getUrlRoot();

	app.use(middlewareFactory(refs));
}

module.exports = {
	init
}
