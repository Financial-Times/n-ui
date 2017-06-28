const logger = require('@financial-times/n-logger').default;
const nUiManager = require('./n-ui-manager');

const loadAssetHashesJson = path => {
	try {
		return require(`${path}`);
	} catch(err) {
		/* istanbul ignore next */
		logger.warn(`${path} not found. Falling back to un-fingerprinted files.`);
		return {};
	}
};

module.exports = ({ appName, isProduction, directory, useLocalAppShell }) => {

	const assetHashes = loadAssetHashesJson(`${directory}/public/asset-hashes.json`);
	const nUiAssetHashes = loadAssetHashesJson(`${directory}/public/n-ui-asset-hashes.json`);
	const nUiReleaseName = nUiManager.getReleaseName(directory);
	const nUiUnhashedAssetsRoot = useLocalAppShell ? `/${appName}/n-ui/` : `//www.ft.com/__assets/n-ui/cached/${nUiReleaseName}/`;

	const getAssetUrl = assetConfig => {

		if (typeof assetConfig === 'string') {
			assetConfig = { file: assetConfig };
		}

		const {file, isNUi = false, flags = {}} = assetConfig;

		if (isNUi) {
			if (flags.nUiHashedAssets) {
				const fallback = `/${appName}/n-ui/${file}`;
				const hash = nUiAssetHashes[file];
				return (useLocalAppShell || !hash) ? fallback : `//www.ft.com/__assets/hashed/n-ui/${hash}`;
			}
			return `${nUiUnhashedAssetsRoot}${file}`;
		} else {
			const fallback = `/${appName}/${file}`;
			const hash = assetHashes[file];
			return (!isProduction || !hash) ? fallback : `//www.ft.com/__assets/hashed/${appName}/${hash}`;
		}
	};

	return getAssetUrl;
};
