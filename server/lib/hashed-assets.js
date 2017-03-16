const logger = require('@financial-times/n-logger').default;

module.exports.init = locals => {
	let assetHashes = {};

	try {
		assetHashes = require(`${locals.__rootDirectory}/public/asset-hashes.json`);
	} catch(err) {
		/* istanbul ignore next */
		logger.warn('./public/asset-hashes.json not found. Falling back to un-fingerprinted files.');
	}

	return {
		get: file => {
			const fallback = `/${locals.__name}/${file}`;
			const hash = assetHashes[file];
			return (!locals.__isProduction || !hash) ? fallback : `//www.ft.com/__assets/hashed/${locals.__name}/${hash}`;
		}
	}
}
