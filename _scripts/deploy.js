const shellpromise = require('shellpromise');
const version = require("../bower_components/n-ui/.bower.json").version.split(".").shift();

shellpromise(`nht deploy-static \`find . -path "./dist/*"\` --destination assets/n-ui/v${version}/ --strip 1 --bucket ft-next-n-ui-prod`, { verbose: true, env: process.env })
	.catch(console.log.bind(console))
