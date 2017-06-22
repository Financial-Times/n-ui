const nUiManager = require('./n-ui-manager');
const linkHeaderHelperFactory = require('./link-header-helper-factory');
const hashedAssets = require('./hashed-assets');

module.exports = (locals, directory) => {
	const assetHasher = hashedAssets.init(locals).get;

	const linkHeaderHelper = linkHeaderHelperFactory(assetHasher);

	nUiManager.init(directory, assetHasher);

	const nUiUrlRoot = nUiManager.getUrlRoot()

	return {
		assetHasher,
		getAssetPath: assetConfig => {
			if (typeof assetConfig === 'string') {
				assetConfig = {file: assetConfig};
			}

			if (assetConfig.isNUi) {
				if (assetConfig.flags.nUiHashedAssets) {
					return assetHasher(assetConfig.file, true);
				} else {
					return `${nUiUrlRoot}${assetConfig.file}`;
				}
			}
			return assetHasher(assetConfig.file);
		},
		linkHeaderHelper
	}
}