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
const getVersions = require('./get-versions');
const {versions, isOfficialRelease} = getVersions();

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

function brotlify () {
	return getFileList('assets').then(files => Promise.all(
		files
			.filter(f => /\.(js|css)$/.test(f))
			.map(fileName =>
				readFile(path.join(process.cwd(), fileName))
					.then(brotli.compress)
					.then(contents => writeFile(path.join(process.cwd(), fileName + '.brotli'), contents))
			)
	))
}

function staticAssets () {
	return brotlify()
		.then(() => getFileList('assets'))
		.then(files => Promise.all(
			versions
				.map((version, i) => {
					return deployStatic({
						files: files,
						destination: `n-ui/cached/${version}`,
						bucket: 'ft-next-n-ui-prod',
						strip: 2,
						monitor: isOfficialRelease && i === 0, // only monitor the size of the first copy deployed,
						monitorStripDirectories: true,
						cacheControl: 'must-revalidate, max-age=1200',
						surrogateControl: 'must-revalidate, max-age=3600, stale-while-revalidate=60, stale-on-error=86400'
					})
						.then(() => files.map(file => {
							const paths = [
								`https://www.ft.com/__assets/n-ui/cached/${version}/${file.split('/').pop()}`
							];
							return Promise.all(paths.map(purge));
						}))
				})
		))
}

function layouts () {
	return getFileList('templates')
		.then(files => Promise.all(
			versions
				.map(version => {
					return deployStatic({
						files: files,
						destination: `templates/${version}`,
						bucket: 'ft-next-n-ui-prod',
						acl: 'private',
						strip: 2,
						cacheControl: 'no-cache, max-age=0, must-revalidate'
					})
				})
		))

}


Promise.all([
	staticAssets(),
	layouts()
])
	.then(() => process.exit(0))
	.catch(err => {
		console.log(err) //eslint-disable-line
		process.exit(2)
	})
