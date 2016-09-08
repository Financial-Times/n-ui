'use strict';
const shellpromise = require('shellpromise');
const semver = require('semver');
const fetch = require('node-fetch');
const deployStatic = require('@financial-times/n-heroku-tools').deployStatic.task;
const tag = process.env.CIRCLE_TAG;
let versions;
let isOfficialRelease = false;

if (!tag) {
	versions = ['dummy-release'];
} else if (!semver.valid(tag) || /(beta|rc)/.test(tag)) {
	versions = [tag];
} else {
	isOfficialRelease = true;
	versions = [
		tag.split('.').slice(0,2).join('.'),
		tag.split('.').slice(0,1).join('.')
	]
}

shellpromise('find . -path "./dist/*"')
	.then(files => {

		files = files.split('\n').filter(f => !!f);
		const deploys = versions.reduce((arr, version, i) => {
			return arr.concat([{
				version,
				monitor: i === 0, // only monitor the size of the first copy deployed
				cacheControl: 'no-cache, must-revalidate, max-age=3600',
				directory: 'no-cache'
			}, {
				version,
				monitor: false,
				cacheControl: 'must-revalidate, max-age=3600',
				directory: 'cached'
			}])
		}, []);

		return Promise.all(deploys.map(conf => {
			return deployStatic({
				files: files,
				destination: `n-ui/${conf.directory}/${conf.version}`,
				bucket: 'ft-next-n-ui-prod',
				strip: 1,
				monitor: isOfficialRelease && conf.monitor,
				cacheControl: conf.cacheControl,
				surrogateControl: 'must-revalidate, max-age=3600, stale-while-revalidate=60, stale-on-error=86400'
			})
				.then(() => files.map(file => {
					const path = `https://next-geebee.ft.com/n-ui/${conf.directory}/${conf.version}/${file.split('/').pop()}`;
					return fetch(path, {
						method: 'PURGE',
						headers: {
							'Fastly-Soft-Purge': 1,
							'Fastly-Key': process.env.FASTLY_API_KEY
						}
					})
					.then(res => {
						if(!res.ok) {
							throw new Error(`failed to purge ${path}`)
						} else {
							console.log(`successfully purged ${path}`)
						}
					})
					.catch(err => {
						console.error(err);
					})
				}))
				.catch(err => {
					console.error(err)
					process.exit(2);
				});

		}));
	})
	.catch(console.log.bind(console))
