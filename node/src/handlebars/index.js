const handlebars = require('@financial-times/n-handlebars');
const Poller = require('ft-poller');
const fs = require('fs');
const vm = require('vm');
// todo calculate properly
const majorVersion = 'v2'

module.exports = function (conf) {
	const app = conf.app;
	const directory = conf.directory;
	const options = conf.options;
	const helpers = options.helpers || {};
	const partialsDir = [
		directory + (options.viewsDirectory || '/views') + '/partials',
		directory + ('/node_modules/@financial-times')
	];

	if (conf.hasher) {
		helpers.hashedAsset = function (options) {
			return conf.hasher.get(options.fn(this));
		};
	}

	// always enable in-memory view caching
	// - needed in prod to allow polling for layout updates
	// - in dev most changes result in the app restarting anyway, so in memory caching shouldn't impair development
	app.enable('view cache');

	if (options.partialsDirectory) {
		partialsDir.push(options.partialsDirectory);
	}

	return handlebars(app, {
		partialsDir,
		defaultLayout: false,
		layoutsDir: options.layoutsDir,
		helpers: helpers,
		directory: directory,
		viewsDirectory: options.viewsDirectory
	})
		.then(instance => {
			if (process.env.NEXT_APP_SHELL !== 'local' && process.env.TRIAL_POLLING_LAYOUTS === 'true') {
				return shellpromise('ls ./layout/*.html')
					.then(files =>
						files.split('\n')
							.filter(f => !!f)
							.map(f => `https://ft-next-n-ui-prod.s3-eu-west-1.amazonaws.com/templates/${majorVersion}/${f.replace(/^\.\//, '')}.precompiled`)
					)
					// .then(urls => urls.concat(`https://ft-next-n-ui-prod.s3-eu-west-1.amazonaws.com/templates/${majorVersion}/latest.json`))
					.then(urls => {
						new Poller({
							url: urls[1],
							refreshInterval: 60000,
							parseData: templates => {
								templates
									.map(tpl => {
										tpl = tpl
											.replace('</body>', `<div style=\\"background: white;position: absolute;top: 0;left:0;color:red;font-size:50px\\">${Date.now()}</div></body>`)
										const script = new vm.Script(`(${tpl})`);
									  const tplAsObj = script.runInNewContext();
										instance.compiled[layoutsDir + '/wrapper.html'] = instance.handlebars.template(tplAsObj);
									})
							},
							autostart: true
						})
					})

			}
			return instance;
		});
}






















 }
