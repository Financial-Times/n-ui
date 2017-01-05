const nExpress = require('@financial-times/n-express')
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

	const defaults = {
		withHandlebars: false,
		withNavigation: false,
		withNavigationHierarchy: false,
		withAnonMiddleware: false,
		hasNUiBundle: true,
		// TODO always default to false for next major version
		withAssets: options.withHandlebars || false,
		hasHeadCss: false,
		withJsonLd: false
	};

	app.locals.__name = name = normalizeName(name);
	app.locals.__environment = process.env.NODE_ENV || '';
	app.locals.__isProduction = app.locals.__environment.toUpperCase() === 'PRODUCTION';
	app.locals.__rootDirectory = directory;

	try {
		app.locals.__version = require(directory + '/public/__about.json').appVersion;
	} catch (e) {}

	// 100% public end points
	if (!app.locals.__isProduction) {
		app.use('/' + name, express.static(directory + '/public', { redirect: false }));
	}

	// set the edition so it can be added to the html tag and used for tracking
	app.use(function(req, res, next) {
		const edition = req.get('ft-edition') || '';
		app.locals.__edition = edition;
		next();
	});

	// set the ab test state so it can be added to the html tag and used by client code
	app.use(function(req, res, next) {
		const abState = req.get('ft-ab') || '';
		app.locals.__abState = abState;
		next();
	});


	if (options.withJsonLd) {
		app.use(function(req, res, next) {
			if (res.locals.flags && res.locals.flags.newSchema) {
				res.locals.jsonLd = [nextJsonLd.webPage()];
			}
			next();
		});
	}

	// verification that expected assets exist
	verifyAssetsExist.verify(app.locals);
	hashedAssets.init(app.locals);

	// add statutory metadata to construct the page
	if (options.withNavigation) {
		const navigation = new NavigationModel({withNavigationHierarchy:options.withNavigationHierarchy});
		const editions = new EditionsModel();
		initPromises.push(navigation.init());
		app.use(editions.middleware.bind(editions));
		app.use(navigation.middleware.bind(navigation));
	}

	if (options.withAnonMiddleware) {
		app.use(anon.middleware);
	}

	if (options.withHandlebars) {

		// Set up handlebars as the templating engine
		initPromises.push(handlebars({
			app: app,
			directory: directory,
			options: options
		}));

		// Decorate responses with data about which assets the page needs
		if (options.withAssets) {
			app.use(assetsMiddleware(options, directory));
		}

		// Handle the akamai -> fastly -> akamai etc. circular redirect bug
		app.use(function (req, res, next) {
			res.locals.forceOptInDevice = req.get('FT-Force-Opt-In-Device') === 'true';
			res.vary('FT-Force-Opt-In-Device');
			next();
		});

		app.use(welcomeBannerModelFactory);
	}
