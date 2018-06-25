const { promisify } = require('util');
const copy = promisify(require('fs-extra').copy);

module.exports = () => {
	if (process.env.NEXT_APP_SHELL === 'local') {
		return Promise.resolve();
	}
	return Promise.all([
		'public/n-ui/head-n-ui-core.css',
		'public/n-ui/asset-hashes.json',
	]
		.map(fileName => copy(`node_modules/@financial-times/n-ui/${fileName}`, fileName)));
};
