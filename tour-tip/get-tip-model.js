import tipsConfig from './config';

const getTipModel = (id) => {
	const tipOriginal = tipsConfig.find(tip => tip.id === id);
	const tipModel = Object.assign({}, tipOriginal);

	return tipModel;
}

export default getTipModel;
