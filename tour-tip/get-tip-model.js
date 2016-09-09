import tipsConfig from './config';

const getTipModel = (id) => {
	const tipFound = tipsConfig.find(tip => tip.id === id);
	if (!tipFound) { return; }
	const tipClone = JSON.parse(JSON.stringify(tipFound));
	return tipClone;
}

export default getTipModel;
