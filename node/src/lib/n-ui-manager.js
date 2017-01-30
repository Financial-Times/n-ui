const semver = require('semver');
const nLogger = require('@financial-times/n-logger').default
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
	}
});


// so hacky, but without clearing out the default set of credential providers, andy passed in to AWS
// config in code get clobbered by the global defaults (i.e. reading from env vars)
s3bucket.config.credentialProvider.providers = AWS.CredentialProviderChain.defaultProviders.slice(10);
s3bucket.config.credentialProvider.providers.push(new AWS.Credentials(process.env.AWS_ACCESS_N_UI, process.env.AWS_SECRET_N_UI))

const getS3Object = denodeify(s3bucket.getObject.bind(s3bucket));

let appBowerJson = {};
let nUiBowerJson = {};

// Tells the app which major version of n-ui to poll for layouts
let nUiMajorVersion;

let shouldPollForLayouts = false;

module.exports.init = (directory, options) => {

	try {
		nUiBowerJson = require(path.join(directory, 'bower_components/n-ui/.bower.json'))
	} catch (e) {}

	if (options.withLayoutPolling) {
		shouldPollForLayouts = true;
	}

	if (process.env.NEXT_APP_SHELL === 'local') {
		shouldPollForLayouts = false;
	}

	if (shouldPollForLayouts) {
		appBowerJson = require(path.join(directory, 'bower.json'));
		nUiMajorVersion = appBowerJson.name === 'n-ui' ? 'dummy-release' : ('v' + appBowerJson.dependencies['n-ui'].replace('^', '').split('.')[0]);
	}
}

let latestNUiVersions;

module.exports.poller = function (handlebarsInstance, app, options) {
	// temporarily disable this feature
	return;
	if (!shouldPollForLayouts) {
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
							.catch(err => {
								nLogger.info(`failed to fetch ${file}`)
								throw err;
							})
					})
				)
					.then(fileContents => {
						files.forEach((file, i) => {
							if (file === 'latest.json') {
								latestNUiVersions = JSON.parse(fileContents[i]).versions;
							} else if (/\.html$/.test(file)) {
								let tpl = fileContents[i];

								// The precompiled template is a javascript file we need to execute
								// This accomplishes that without writing to disk or leaking scope
								const script = new vm.Script(`(${tpl})`);
								const tplAsObj = script.runInNewContext();
								handlebarsInstance.compiled[`${options.layoutsDir}/${file}`] = handlebarsInstance.handlebars.template(tplAsObj);
							}
						})
					})
					.then(() => nLogger.info('Layout templates updated'))
					.catch(err => {
						nLogger.error(err)
					});
			}, process.env.LAYOUT_POLLING_INTERVAL || 60000)
		})
}

let defaultUrlRoot;

function getDefaultUrlRoot (hashedAssets) {
	if (!defaultUrlRoot) {

		let nUiUrlRoot;
		const localAppShell = process.env.NEXT_APP_SHELL === 'local';
		// Attempt to get information about which version of n-ui is installed
		try {
			if (localAppShell) {
				nUiUrlRoot = hashedAssets.get('n-ui/');
			} else {
				const nUiRelease = nUiBowerJson._release;
				if (!semver.valid(nUiRelease)) {
					// for non semver releases, use the tag in its entirety
					nUiUrlRoot = nUiRelease;
				}	else if (/(beta|rc)/.test(nUiRelease)) {
					// for beta releases, prepend a v
					nUiUrlRoot = 'v' + nUiRelease;
				} else {
					// for normal semver releases prepend a v to the major version
					nUiUrlRoot = 'v' + nUiRelease.split('.').slice(0,1)[0]
				}
				nUiUrlRoot = `//www.ft.com/__assets/n-ui/cached/${nUiUrlRoot}/`;
			}

		} catch (e) {}
		defaultUrlRoot = nUiUrlRoot;
	}

	return defaultUrlRoot;

}

module.exports.getUrlRoot = (hashedAssets) => {
	if (shouldPollForLayouts && latestNUiVersions) {
		return `//www.ft.com/__assets/n-ui/cached/${latestNUiVersions[0]}/`;
	} else {
		return getDefaultUrlRoot(hashedAssets);
	}
}
