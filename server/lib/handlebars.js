const handlebars = require('@financial-times/n-handlebars');

module.exports = function (conf) {
	const app = conf.app;
	const directory = conf.directory;
	const options = conf.options;
	const partialsDir = [
		directory + (options.viewsDirectory || '/views') + '/partials',
		directory + ('/node_modules/@financial-times'),
		directory + ('/node_modules/@financial-times/n-ui/components'),
		directory + ('/node_modules/@financial-times/n-ui/browser')
	];

	if (options.partialsDirectory) {
		if (Array.isArray(options.partialsDirectory)) {
			partialsDir.push.apply(partialsDir, options.partialsDirectory);
		} else {
			partialsDir.push(options.partialsDirectory);
		}
	}

	return handlebars(app, {
		partialsDir,
		defaultLayout: false,
		layoutsDir: options.layoutsDir,
		helpers: options.helpers || {},
		directory: directory,
		viewsDirectory: options.viewsDirectory
	})
}
