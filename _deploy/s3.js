'use strict';
const shellpromise = require('shellpromise');
const semver = require('semver');
const fetch = require('node-fetch');
const deployStatic = require('@financial-times/n-heroku-tools').deployStatic.task;
const brotli = require('brotli');
const denodeify = require('denodeify');
const path = require('path')
const fs = require('fs');
const readFile = denodeify(fs.readFile);
const writeFile = denodeify(fs.writeFile);

let tag = process.env.CIRCLE_TAG;
let versions;
let isOfficialRelease = false;

if (!tag) {
	versions = ['dummy-release'];
} else if (!semver.valid(tag) || /(beta|rc)/.test(tag)) {
	versions = [tag];
} else {
	isOfficialRelease = true;
	if (tag.charAt(0) !== 'v') {
		tag = `v${tag}`;
	}
	versions = [
		tag.split('.').shift(),
		tag
	]
}

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

function brotlify () {
	return shellpromise('find . -path "./dist/*"')
		.then(files => Promise.all(
			files.split('\n')
				.filter(f => !!f && /\.(js|css)$/.test(f))
				.map(f => f.trim())
				.map(fileName =>
					readFile(path.join(process.cwd(), fileName), 'utf8')
						.then(brotli.compress)
						.then(contents => writeFile(path.join(process.cwd(), fileName + '.brotli'), contents))
				)
		))
}


function getDeployList () {
	return shellpromise('find . -path "./dist/*"')
		.then(files =>
			files.split('\n')
				.filter(f => !!f)
				.filter(f => !/^n-ui-core\.css/.test(f))
		)
}

brotlify()
	.then(getDeployList)
	.then(files => Promise.all(
		versions
			.map((version, i) => {
				return deployStatic({
					files: files,
					destination: `n-ui/cached/${version}`,
					bucket: 'ft-next-n-ui-prod',
					strip: 1,
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
	.catch(err => {
		console.log(err) //eslint-disable-line
		process.exit(2)
	})
