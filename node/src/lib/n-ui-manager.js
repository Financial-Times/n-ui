const vm = require('vm');
const path = require('path');
const fs = require('fs');
const denodeify = require('denodeify');
const readdir = denodeify(fs.readdir.bind(fs));
const AWS = require('aws-sdk');

const s3bucket = new AWS.S3({
	params: {
		Bucket: 'ft-next-n-ui-prod' + (process.env.REGION === 'US' ? '-us' : ''),
		region: process.env.REGION === 'US' ? 'us-east-1' : 'eu-west-1',
		accessKeyId: process.env.AWS_ACCESS_N_UI,
		secretAccessKey: process.env.AWS_SECRET_N_UI
	}
});

const getS3Object = denodeify(s3bucket.getObject.bind(s3bucket));

const bowerJson = require(path.join(process.cwd(), 'bower.json'));

// Tells the app which major version of n-ui to poll for layouts
let nUiMajorVersion = bowerJson.name === 'n-ui' ? 'dummy-release' : bowerJson.dependencies['n-ui'].replace('^', '').split('.')[0];

// This is temporary so I can enable it on a really unimportant app for a little while
let shouldPollForLayouts = false;

if (process.env.TEST_POLLING_LAYOUTS === 'true') {
	shouldPollForLayouts = true;
}

if (process.env.NEXT_APP_SHELL === 'local') {
	shouldPollForLayouts = false;
}

module.exports.poller = function (handlebarsInstance, app, options) {
	if (!shouldPollForLayouts || !options.withLayoutPolling) {
		return
	}
	readdir(options.layoutsDir)
		.then(files => files.filter(f => /\.html$/.test(f)))
		// in additional to the templates, also fetch a json containing
		// the latests version number of n-ui, so that this can be referenced
		// from the template
		.then(files => files.concat('latest.json'))
		.then(files => {
			setInterval(() => {
				// update all the files in parallel - if any requests fail,
				// don't update any
				Promise.all(
					files.map(file => {
						if (/\.html$/.test(file)) {
							file = file + '.precompiled'
						}
						return getS3Object({
							Key: `templates/${nUiMajorVersion}/${file}`,
							ResponseContentEncoding: 'utf8'
						})
							.then(obj => obj.Body.toString('utf8'))
					})
				)
					.then(fileContents => {
						files.forEach((file, i) => {
							if (file === 'latest.json') {
								app.locals.latestNUiVersions = JSON.parse(fileContents[i]).versions;
							} else if (/\.html$/.test(file)) {
								let tpl = fileContents[i];

								if (process.env.DEBUG_LAYOUT_POLLING) {
									tpl = tpl.replace('</body>', `<script>console.log("${Date.now()}");</script></body>`)
								}

								// The precompiled template is a javascript file we need to execute
								// This accomplishes that without writing to disk or leaking scope
								const script = new vm.Script(`(${tpl})`);
								const tplAsObj = script.runInNewContext();
								handlebarsInstance.compiled[`${options.layoutsDir}/${file}`] = handlebarsInstance.handlebars.template(tplAsObj);
							}
						})
					})
			}, 60000)
		})
}
