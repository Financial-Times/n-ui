const logger = require('@financial-times/n-logger').default;

module.exports.init = ({ locals }) => {
	let assetHashes = {};

	try {
		assetHashes = require(`${locals.__rootDirectory}/public/asset-hashes.json`);
	} catch(err) {
		/* istanbul ignore next */
		logger.warn('./public/asset-hashes.json not found. Falling back to un-fingerprinted files.');
	}

	let nUiAssetHashes = {};

	try {
		nUiAssetHashes = require(`${locals.__rootDirectory}/public/n-ui-asset-hashes.json`);
	} catch(err) {
		/* istanbul ignore next */
		logger.warn('./public/asset-hashes.json not found. Falling back to un-fingerprinted files.');
	}

	return {
		get: (file, isNui) => {
			const fallback = `/${locals.__name}/${file}`;
			const hashPath = isNui ? `n-ui/${nUiAssetHashes[file]}` : `${locals.__name}/${assetHashes[file]}`;
			return (!locals.__isProduction || !hashPath) ? fallback : `//www.ft.com/__assets/hashed/${hashPath}`;
		}
	}
}
