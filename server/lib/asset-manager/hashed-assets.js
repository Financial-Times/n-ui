const logger = require('@financial-times/n-logger').default;

module.exports.init = (locals, useLocalAppShell) => {
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

			if (isNui) {
				const fallback = `/${locals.__name}/n-ui/${file}`;
				const hashPath = `n-ui/${nUiAssetHashes[file]}`;
				return (useLocalAppShell || !hashPath) ? fallback : `//www.ft.com/__assets/hashed/${hashPath}`;
			} else {
				const fallback = `/${locals.__name}/${file}`;
				const hashPath = `${locals.__name}/${assetHashes[file]}`;
				return (!locals.__isProduction || !hashPath) ? fallback : `//www.ft.com/__assets/hashed/${hashPath}`;
			}
		}
	}
}
