'use strict';
const shellpromise = require('shellpromise');
const fetch = require('node-fetch');
const deployStatic = require('@financial-times/n-heroku-tools').deployStatic.task;
const getVersion = require('./get-version');
const {version, isOfficialRelease} = getVersion();
const semver = require('semver');
const expectedBuiltFiles = require('./expected-built-files');

function purgeOnce (path, message) {
	return fetch(path, {
			method: 'PURGE',
			headers: {
				'Fastly-Soft-Purge': 1,
				'Fastly-Key': process.env.FASTLY_API_KEY
			}
		})
		.then(res => {
			if(!res.ok) {
				throw new Error(`failed to purge ${path}: status ${res.status}`);
			} else {
				console.log(`Purging ${path}: ${message}`) //eslint-disable-line
			}
		});
}

function purge (path) {
	return purgeOnce(path, 'going once')
		.then(() => purgeOnce(path, 'going twice'))
		.then(() => purgeOnce(path, 'going three times'))
		.then(() => purgeOnce(path, '...gone!'));
}

function getFileList (dir) {
	return shellpromise(`find . -path "./dist/${dir}/*"`)
		.then(files =>
			files.split('\n')
				.filter(f => !!f)
		);
}

function noUnexpectedAssets (files) {
	files
		.filter(f => /\.(js|css)$/.test(f))
		.map(filename => filename.split('/').pop())
		.map(filename => {
			if(expectedBuiltFiles.indexOf(filename) === -1) {
				throw new Error(`\
${filename} has been built but is not in the expectedBuiltFiles list.
To avoid future regressions please add to the list (in build/deploy/s3.js)
`);
			}
		});
	return files;
}

function staticAssets () {
	return getFileList('assets')
		.then(noUnexpectedAssets)
		.then(files =>
			deployStatic({
				files: files,
				destination: `n-ui/cached/${version}`,
				bucket: 'ft-next-n-ui-prod',
				strip: 2,
				monitor: isOfficialRelease,
				waitForOk: true,
				monitorStripDirectories: true,
				// cache resources which use valid semver for a long time, as these are never overwritten
				// cache e.g v2, v2.2 entries with shorter, revalidatable headers
				cacheControl: semver.valid(version) ? 'max-age=31536000, immutable' : 'must-revalidate, max-age=1200',
				surrogateControl: semver.valid(version) ? 'max-age=31536000, immutable' : 'must-revalidate, max-age=3600, stale-while-revalidate=60, stale-on-error=86400'
			})
				.then(() => {
					if (!semver.valid(version)) {
						return Promise.all(
							files.map(file => purge(`https://www.ft.com/__assets/n-ui/cached/${version}/${file.split('/').pop()}`))
						);
					}
				})
		);
}

staticAssets()
	.then(() => process.exit(0))
	.catch(err => {
		console.log(err) //eslint-disable-line
		process.exit(2);
	});
