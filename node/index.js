const nExpress = require('@financial-times/n-express')
const nextJsonLd = require('@financial-times/next-json-ld');
const path = require('path');
const fs = require('fs');
// Models
const NavigationModel = require('./src/navigation/navigationModel');
const EditionsModel = require('./src/navigation/editionsModel');
const anon = require('./src/anon');
const welcomeBannerModelFactory = require('./src/welcome-banner/model');

// templating and assets
const handlebars = require('./src/handlebars');
const hashedAssets = require('./src/lib/hashed-assets');
const assetsMiddleware = require('./src/middleware/assets');
const verifyAssetsExist = require('./src/lib/verify-assets-exist');
const nUiManager = require('./src/lib/n-ui-manager');

module.exports = options => {

	options = Object.assign({}, {
		withHandlebars: true,
		withNavigation: true,
		withNavigationHierarchy: false,
		withAnonMiddleware: true,
		withNUiJsBundle: true,
		withAssets: true,
		withHeadCss: true,
		withJsonLd: true,
		withFlags: true,
		withBackendAuthentication: true,
		withServiceMetrics: true,
		withLayoutPolling: true,
		layoutsDir: path.join(__dirname, '../layout'),
	}, options || {});

	const {app, meta, addInitPromise} = nExpress.getAppContainer(options)

	app.locals.__name = meta.name;
	app.locals.__environment = process.env.NODE_ENV || '';
	app.locals.__isProduction = app.locals.__environment.toUpperCase() === 'PRODUCTION';
	app.locals.__rootDirectory = meta.directory;

	nUiManager.init(meta.directory, options);

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
		app.use('/' + meta.name, nExpress.static(meta.directory + '/public', { redirect: false }));
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
		const navigation = new NavigationModel({withNavigationHierarchy:options.withNavigationHierarchy});
		const editions = new EditionsModel();
		addInitPromise(navigation.init());
		app.use(editions.middleware.bind(editions));
		app.use(navigation.middleware.bind(navigation));
	}

	if (options.withAnonMiddleware) {
		app.use(anon.middleware);
	}

	if (options.withFlags) {
		app.use(welcomeBannerModelFactory);
	}

	// Handle the akamai -> fastly -> akamai etc. circular redirect bug
	app.use(function (req, res, next) {
		res.locals.forceOptInDevice = req.get('FT-Force-Opt-In-Device') === 'true';
		res.vary('FT-Force-Opt-In-Device');
		next();
	});

	// verification that expected assets exist
	if (options.withAssets) {
		verifyAssetsExist.verify(app.locals);
		let hasher = hashedAssets.init(app.locals);
		app.getHashedAssetUrl = hasher.get;
		app.use(assetsMiddleware(options, meta.directory, hasher));
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
}

module.exports.Router = nExpress.Router;
module.exports.static = nExpress.static;
module.exports.metrics = nExpress.metrics;
module.exports.flags = nExpress.flags;
