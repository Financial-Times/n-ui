const nExpress = require('@financial-times/n-express');
const nextJsonLd = require('@financial-times/next-json-ld');
const path = require('path');
const fs = require('fs');

// Models
const navigation = require('./models/navigation/');
const EditionsModel = require('./models/navigation/editionsModel');
const anon = require('./models/anon');

// templating and assets
const handlebars = require('./lib/handlebars');
const assetManager = require('./lib/asset-manager');

module.exports = options => {

	options = Object.assign({}, {
		withHandlebars: true,
		withNavigation: true,
		withAnonMiddleware: true,
		withAssets: true,
		withJsonLd: false,
		withFlags: true,
		withBackendAuthentication: true,
		withServiceMetrics: true,
		product: 'kat',
		layoutsDir: path.join(__dirname, '../browser/layout'),
	}, options || {});

	const {app, meta, addInitPromise} = nExpress.getAppContainer(options);

	app.locals.__name = meta.name;
	app.locals.__product = options.product;
	app.locals.__environment = process.env.NODE_ENV || '';
	app.locals.__isProduction = app.locals.__environment.toUpperCase() === 'PRODUCTION';
	app.locals.__rootDirectory = meta.directory;

	try {
		// expose app version to the client side
		app.locals.__version = require(meta.directory + '/public/__about.json').appVersion;

		// expose n-ui version to monitoring
		const nUiVersion = require(path.join(meta.directory, 'node_modules/@financial-times/n-ui/package.json')).version;
		const about = require(path.join(meta.directory, '/public/__about.json'));
		about.nUiVersion = nUiVersion;
		fs.writeFileSync(path.join(meta.directory, '/public/__about.json'), JSON.stringify(about));
	} catch (e) {}

	// 100% public end points
	if (!app.locals.__isProduction) {
		app.use('/__dev/assets/' + meta.name, nExpress.static(meta.directory + '/public', { redirect: false }));
	}

	// set the edition so it can be added to the html tag and used for tracking
	app.use(function (req, res, next) {
		const edition = req.get('ft-edition') || '';
		app.locals.__edition = edition;
		next();
	});

	// set the ab test state so it can be added to the html tag and used by client code
	app.use(function (req, res, next) {
		const abState = req.get('ft-ab') || '';
		app.locals.__abState = abState;
		next();
	});

	// set whether or not to disable the app install banner.
	app.use(function (req, res, next) {
		app.locals.__disableAndroidBanner = (!res.locals.flags.subscriberCohort || res.locals.flags.disableAndroidSmartBanner);
		app.locals.__disableIosSmartBanner = (!res.locals.flags.subscriberCohort || res.locals.flags.disableIosSmartBanner);

		next();
	});

	if (options.withJsonLd) {
		app.use(function (req, res, next) {
			if (res.locals.flags && res.locals.flags.newSchema) {
				res.locals.jsonLd = [nextJsonLd.webPage()];
			}
			next();
		});
	}

	// add statutory metadata to construct the page
	if (options.withNavigation) {
		const editions = new EditionsModel();
		addInitPromise(navigation.init({withNavigationHierarchy:options.withNavigationHierarchy}));
		app.use(editions.middleware.bind(editions));
		app.use(navigation.middleware);
	}

	if (options.withAnonMiddleware) {
		app.use(anon.middleware);
	}

	// Handle the akamai -> fastly -> akamai etc. circular redirect bug
	app.use(function (req, res, next) {
		res.locals.forceOptInDevice = req.get('FT-Force-Opt-In-Device') === 'true';
		res.vary('FT-Force-Opt-In-Device');
		next();
	});

	if (options.withAssets) {
		assetManager.init(options, meta.directory, app);
	}

	if (options.withHandlebars) {
		// Set up handlebars as the templating engine
		addInitPromise(handlebars({
			app,
			directory: meta.directory,
			options
		}));
	}

	return app;
};

module.exports.Router = nExpress.Router;
module.exports.static = nExpress.static;
module.exports.metrics = nExpress.metrics;
module.exports.flags = nExpress.flags;
