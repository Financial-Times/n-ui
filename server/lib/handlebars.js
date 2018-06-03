const handlebars = require('@financial-times/n-handlebars');

module.exports = conf => {
	const { app, directory, options } = conf;
	const partialsDir = [
		`${directory}${options.viewsDirectory || '/views'}/partials`,
		`${directory}/node_modules/@financial-times`,
		`${directory}/node_modules/@financial-times/n-ui/components`,
		`${directory}/node_modules/@financial-times/n-ui/browser`
	];

	const {
		partialsDirectory,
		layoutsDir,
		helpers = {},
		viewsDirectory
	} = options;

	if (partialsDirectory) {
		if (Array.isArray(partialsDirectory)) {
			partialsDir.push.apply(partialsDir, partialsDirectory);
		} else {
			partialsDir.push(partialsDirectory);
		}
	}

	return handlebars(app, {
		partialsDir,
		defaultLayout: false,
		layoutsDir,
		helpers,
		directory,
		viewsDirectory
	});
};
