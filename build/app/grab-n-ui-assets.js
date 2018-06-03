const { promisify } = require('uril');
const fsx = require('fs-extra');
const copy = promisify(fsx.copy);

module.exports = async () => {
	if (process.env.NEXT_APP_SHELL === 'local') {
		return;
	}
	return await Promise.all([
		'public/n-ui/head-n-ui-core.css',
		'public/n-ui/asset-hashes.json'
	].map(
			fileName => copy(`node_modules/@financial-times/n-ui/${fileName}`, fileName)
		)
	);
};
