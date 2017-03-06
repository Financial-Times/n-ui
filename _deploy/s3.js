'use strict';
const shellpromise = require('shellpromise');
const fetch = require('node-fetch');
const deployStatic = require('@financial-times/n-heroku-tools').deployStatic.task;
const brotli = require('brotli');
const denodeify = require('denodeify');
const path = require('path')
const fs = require('fs');
const readFile = denodeify(fs.readFile);
const writeFile = denodeify(fs.writeFile);
const getVersion = require('./get-version');
const {version, isOfficialRelease} = getVersion();
const semver = require('semver');

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
				throw new Error(`failed to purge ${path}: status ${res.status}`)
			} else {
				console.log(`Purging ${path}: ${message}`) //eslint-disable-line
			}
		})
}

function purge (path) {
	return purgeOnce(path, 'going once')
		.then(() => purgeOnce(path, 'going twice'))
		.then(() => purgeOnce(path, 'going three times'))
		.then(() => purgeOnce(path, '...gone!'))
}

function getFileList (dir) {
	return shellpromise(`find . -path "./dist/${dir}/*"`)
		.then(files =>
			files.split('\n')
				.filter(f => !!f)
		)
}

const expectedBuiltFiles = [
	'es5.js',
	'es5.min.js',
	'head-n-ui-core.css',
	'n-ui-core.css'
]

function expectedAssets () {
	return Promise.resolve(
		expectedBuiltFiles
			.map(filename => {
				if(!fs.existsSync(path.join(__dirname, '../dist/assets/', filename))) {
					throw new Error(`${filename} has not been built`);
				}
				return `./dist/assets/${filename}`
			})
	)
}

function noUnexpectedAssets (files) {
	files
		.filter(f => /\.(js|css)$/.test(f))
		.map(filename => filename.split('/').pop())
		.map(filename => {
			if(expectedBuiltFiles.indexOf(filename) === -1) {
				throw new Error(`\
${filename} has been built but is not in the expectedBuiltFiles list.
To avoid future regressions please add to the list (in _deploy/s3.js)
`);
			}
		})
	return files;
}

function brotlify (files) {
	return Promise.all(
		files
			.map(fileName =>
				readFile(path.join(process.cwd(), fileName))
					.then(brotli.compress)
					.then(contents => writeFile(path.join(process.cwd(), fileName + '.brotli'), contents))
			)
	)
}

function staticAssets () {
	return expectedAssets()
		.then(brotlify)
		.then(() => getFileList('assets'))
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
						)
					}
				})
		)
}

staticAssets()
	.then(() => process.exit(0))
	.catch(err => {
		console.log(err) //eslint-disable-line
		process.exit(2)
	})
