const logger = require('@financial-times/n-logger').default;
const nUiManager = require('./n-ui-manager');
const linkHeaderHelperFactory = require('./link-header-helper-factory');

const readJsonHash = path => {
	try {
		return require(`${path}`);
	} catch(err) {
		/* istanbul ignore next */
		logger.warn(`${path} not found. Falling back to un-fingerprinted files.`);
		return {};
	}
}

module.exports = (locals, directory, useLocalAppShell) => {

	const assetHashes = readJsonHash(`${directory}/public/asset-hashes.json`);
	const nUiAssetHashes = readJsonHash(`${directory}/public/n-ui-asset-hashes.json`);
	const nUiReleaseName = nUiManager.getReleaseName(directory);
	const nUiUnhashedAssetsRoot = useLocalAppShell ? '/${locals.__name}/n-ui/' : `//www.ft.com/__assets/n-ui/cached/${nUiReleaseName}/`;

	const getAssetPath = (assetConfig) => {

		if (typeof assetConfig === 'string') {
			assetConfig = {file: assetConfig};
		}

		const {file, isNUi = false, flags = {}} = assetConfig;

		if (isNUi && !flags.nUiHashedAssets) {
			return `${nUiUnhashedAssetsRoot}${file}`;
		}

		if (isNUi) {
			const fallback = `/${locals.__name}/n-ui/${file}`;
			const hash = nUiAssetHashes[file];
			return (useLocalAppShell || !hash) ? fallback : `//www.ft.com/__assets/hashed/n-ui/${hash}`;
		} else {
			const fallback = `/${locals.__name}/${file}`;
			const hash = assetHashes[file];
			return (!locals.__isProduction || !hash) ? fallback : `//www.ft.com/__assets/hashed/${locals.__name}/${hash}`;
		}
	}

	return {
		assetHasher: getAssetPath,
		getAssetPath: getAssetPath,
		linkHeaderHelper: linkHeaderHelperFactory(getAssetPath)
	}
}
