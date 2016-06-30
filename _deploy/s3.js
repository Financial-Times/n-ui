'use strict';
const shellpromise = require('shellpromise');
let versions = [require('../bower_components/n-ui/.bower.json').version];

if (!/(beta|rc)/.test(versions[0])) {
	versions[0] = versions[0].split('.').slice(0,2).join('.');
	versions.push(versions[0].split('.').slice(0,1)[0]);
}

Promise.all(versions.map(version => {
	return shellpromise(`nht deploy-static \`find . -path "./dist/*"\` --destination n-ui/v${version}/ --strip 1 --bucket ft-next-n-ui-prod --cache-control 'must-revalidate, max-age=3600'`);
}));
