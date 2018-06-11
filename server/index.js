const nExpress = require('@financial-times/n-express');
const nextJsonLd = require('@financial-times/next-json-ld');
const path = require('path');
const fs = require('fs');

// Models
const navigation = require('./models/navigation/');
const EditionsModel = require('./models/navigation/editionsModel');
const currentYearModelMiddleware = require('./models/current-year');

// templating and assets
const handlebars = require('./lib/handlebars');
const assetManager = require('./lib/asset-manager');

module.exports = options => {
	options = Object.assign(
		{},
		{
			// hack: shouldn't be able to turn off, but it makes writing tests SOOO much easier
			withAssets: true,
			withHandlebars: true,

			withJsonLd: false,
			withBackendAuthentication: true,
			withServiceMetrics: true,
			product: '',
			layoutsDir: path.join(__dirname, '../browser/layout')
		},
		options || {},
		{
			// the options below are forced to be on
			withNavigation: true,
			withAnonMiddleware: true,
			withCurrentYearMiddleware: true,
			withFlags: true,
			withConsent: true
		}
	);

	const { app, meta, addInitPromise } = nExpress.getAppContainer(options);

	app.locals.__name = meta.name;
	app.locals.__product = options.product;
	app.locals.__environment = process.env.NODE_ENV || '';
	app.locals.__isProduction = app.locals.__environment.toUpperCase() === 'PRODUCTION';
	app.locals.__rootDirectory = meta.directory;
	app.locals.__sentryEndpoint = process.env.RAVEN_URL;

	try {
		// expose app version to the client side
		app.locals.__version = require(`${meta.directory}/public/__about.json`).appVersion;

		// expose n-ui version to monitoring
		const { version: nUiVersion } = require(path.join(
			meta.directory,
			'node_modules/@financial-times/n-ui/package.json'
		));
		const about = require(path.join(meta.directory, '/public/__about.json'));
		about.nUiVersion = nUiVersion;
		fs.writeFileSync(
			path.join(meta.directory, '/public/__about.json'),
			JSON.stringify(about)
		);
	} catch (e) {}

	// 100% public end points
	if (!app.locals.__isProduction) {
		app.use(
			`/__dev/assets/${meta.name}`,
			nExpress.static(`${meta.directory}/public`, { redirect: false })
		);
	}

	// ccommon middleware
	app.use((req, res, next) => {
		// set the edition so it can be added to the html tag and used for tracking
		const edition = req.get('ft-edition') || '';
		app.locals.__edition = edition;

		// set the ab test state so it can be added to the html tag and used by client code
		const abState = req.get('ft-ab') || '';
		app.locals.__abState = abState;

		// set whether or not to disable the app install banner.
		app.locals.__disableMobilePhoneBanner = !res.locals.flags.subscriberCohort;

		if (options.withJsonLd && res.locals.flags.newSchema) {
			res.locals.jsonLd = [nextJsonLd.webPage()];
		}

		// Handle the akamai -> fastly -> akamai etc. circular redirect bug
		res.locals.forceOptInDevice = req.get('FT-Force-Opt-In-Device') === 'true';
		res.vary('FT-Force-Opt-In-Device');

		next();
	});

	// add statutory metadata to construct the page
	if (options.withNavigation) {
		const editions = new EditionsModel();
		addInitPromise(
			navigation.init({
				withNavigationHierarchy: options.withNavigationHierarchy
			})
		);
		app.use(editions.middleware.bind(editions));
		app.use(navigation.middleware);
	}

	if (options.withCurrentYearMiddleware) {
		app.use(currentYearModelMiddleware);
	}

	if (options.withAssets) {
		assetManager.init(options, meta.directory, app);
	}

	if (options.withHandlebars) {
		// Set up handlebars as the templating engine
		addInitPromise(
			handlebars({
				app,
				directory: meta.directory,
				options
			})
		);
	}

	return app;
};

module.exports.Router = nExpress.Router;
module.exports.static = nExpress.static;
module.exports.metrics = nExpress.metrics;
module.exports.flags = nExpress.flags;
