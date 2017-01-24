const handlebars = require('@financial-times/n-handlebars');
const nUiManager = require('../lib/n-ui-manager');


module.exports = function (conf) {
	const app = conf.app;
	const directory = conf.directory;
	const options = conf.options;
	const partialsDir = [
		directory + (options.viewsDirectory || '/views') + '/partials',
		directory + ('/node_modules/@financial-times')
	];

	// always enable in-memory view caching
	// - needed in prod to allow polling for layout updates
	// - in dev most changes result in the app restarting anyway, so in-memory caching shouldn't impair development
	app.enable('view cache');

	if (options.partialsDirectory) {
		partialsDir.push(options.partialsDirectory);
	}

	return handlebars(app, {
		partialsDir,
		defaultLayout: false,
		layoutsDir: options.layoutsDir,
		helpers: options.helpers || {},
		directory: directory,
		viewsDirectory: options.viewsDirectory
	})
		.then(instance => {
			nUiManager.poller(instance, app, options)
			return instance;
		});
}
