const shell = require('shellpromise');

const grabNUiAsset = (fileName) => {
	if (process.env.NEXT_APP_SHELL === 'local') {
		return Promise.resolve();
	}
	return shell(`cp node_modules/@financial-times/n-ui/${fileName} ${fileName}`);
};


module.exports = () => {
	return Promise.all([
		grabNUiAsset('public/n-ui/head-n-ui-core.css'),
		grabNUiAsset('public/n-ui/asset-hashes.json'),
	]);
};
