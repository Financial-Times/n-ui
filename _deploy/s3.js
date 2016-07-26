'use strict';
const shellpromise = require('shellpromise');
let versions = [require('../bower_components/n-ui/.bower.json').version];

if (!versions[0]) {
	versions = ['dummy-release'];
} else if (!/(beta|rc)/.test(versions[0])) {
	versions[0] = versions[0].split('.').slice(0,2).join('.');
	versions.push(versions[0].split('.').slice(0,1)[0]);
}

Promise.all(versions.map(version => {
	return shellpromise(`nht deploy-static \`find . -path "./dist/*"\` --destination n-ui/no-cache/v${version}/ \\
		--strip 1 --bucket ft-next-n-ui-prod \\
		--surrogate-control 'must-revalidate, max-age=3600, stale-while-revalidate=60, stale-on-error=86400' \\
		--cache-control 'no-cache, must-revalidate, max-age=3600' --monitor`,
	{verbose: true})
		.catch(err => {
			console.error(err)
			process.exit(2);
		});

}));
