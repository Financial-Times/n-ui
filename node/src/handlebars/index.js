const handlebars = require('@financial-times/n-handlebars');
const vm = require('vm');
const path = require('path');
const shellpromise = require('shellpromise');
const AWS = require('aws-sdk');
const denodeify = require('denodeify');
const s3bucket = new AWS.S3({
	params: {
		Bucket: 'ft-next-n-ui-prod' + (process.env.REGION === 'US' ? '-us' : ''),
		region: process.env.REGION === 'US' ? 'us-east-1' : 'eu-west-1',
		accessKeyId: process.env.AWS_ACCESS_N_UI,
		secretAccessKey: process.env.AWS_SECRET_N_UI
	}
});

const getS3Object = denodeify(s3bucket.getObject.bind(s3bucket));

// todo calculate properly
const majorVersion = require(path.join(process.cwd(), 'bower.json')).dependencies['n-ui'].replace('^', '').split('.')[0];

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
			if (process.env.NEXT_APP_SHELL !== 'local' && process.env.TEST_POLLING_LAYOUTS === 'true') {
				shellpromise('ls ./layout/*.html')
					.then(files =>
						files.split('\n')
							.filter(f => !!f)
							.map(f => f.replace(/^\.\/layout\//, ''))
					)
					.then(files => files.concat('latest.json'))
					.then(fileNames => {
						setInterval(() => {
							Promise.all(
								fileNames.map(fileName => {
									if (/\.html$/.test(fileName)) {
										fileName = fileName + '.precompiled'
									}
									return getS3Object({
										Key: `templates/${majorVersion}/${fileName}`,
										ResponseContentEncoding: 'utf8'
									})
										.then(obj => obj.Body.toString('utf8'))
								})
							)
								.then(fileContents => {
									fileNames.forEach((fileName, i) => {
										if (fileName === 'latest.json') {
											app.locals.latestNUiVersions = JSON.parse(fileContents[i]).versions;
										} else if (/\.html$/.test(fileName)) {
											let tpl = fileContents[i];
											if (process.env.SHOW_LAYOUT_TIME) {
												tpl = tpl.replace('</body>', `<div style=\\"background: white;position: absolute;top: 0;left:0;color:red;font-size:50px\\">${Date.now()}</div></body>`)
											}
											const script = new vm.Script(`(${tpl})`);
											const tplAsObj = script.runInNewContext();
											instance.compiled[`${options.layoutsDir}/${fileName}`] = instance.handlebars.template(tplAsObj);
										}
									})
								})
						}, 10000)
					})
			}
			return instance;
		});
}
