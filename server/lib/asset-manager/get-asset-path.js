module.exports = (nUiUrlRoot, assetHasher) => {
	return assetConfig => {
		if (typeof assetConfig === 'string') {
			assetConfig = {file: assetConfig};
		}

		if (assetConfig.isNUi) {
			if (assetConfig.flags.nUiHashedAssets) {
				return assetHasher(file, true);
			} else {
				return `${nUiUrlRoot}${file}`;
			}
		}
		return assetHasher(file);
	}
}