'use strict';
const shellpromise = require('shellpromise');
const semver = require('semver');
const tag = process.env.CIRCLE_TAG;
let versions;

if (!tag) {
	versions = ['dummy-release'];
} else if (!semver.valid(tag) || /(beta|rc)/.test(tag)) {
	versions = [tag];
} else {
	versions = [
		tag.split('.').slice(0,2).join('.'),
		tag.split('.').slice(0,1).join('.')
	]
}

Promise.all(versions.map((version, i) => {
	return shellpromise(`nht deploy-static \`find . -path "./dist/*"\` --destination n-ui/no-cache/${version}/ \\
		--strip 1 --bucket ft-next-n-ui-prod \\
		--surrogate-control 'must-revalidate, max-age=3600, stale-while-revalidate=60, stale-on-error=86400' \\
		--cache-control 'no-cache, must-revalidate, max-age=3600'${i === 0 ? ' --monitor' : ''}`, {verbose: true})
		.then(() => {
			return shellpromise('find . -path "./dist/*"')
				.then(files => files.split('\n')
					.map(file => {
						return fetch(`https://next-geebee.ft.com/n-ui/no-cache/${version}/${file.split('/').pop()}`, {
							method: 'PURGE',
							headers: {
								'Fastly-Soft-Purge': 1,
								'Fastly-Key': process.env.FASTLY_API_KEY
							}
						})
						.then(res => {
							if(!res.ok) {
								throw new Error(`failed to purge ${file}`)
							}
						})
						.catch(err => {
							console.error(err);
						})
					})
				);
		})
		.catch(err => {
			console.error(err)
			process.exit(2);
		});

}));
