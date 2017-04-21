const AssetHashes = require('./addons/asset-hashes');

module.exports = function (config) {
	if (config.isProd) {
		config.plugins.push(new AssetHashes());
	}
	return config;
}
