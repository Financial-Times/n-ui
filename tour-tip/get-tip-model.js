import config from './config.json';
const tipsConfig = config.sections;

function deepCopy (obj) {
	return JSON.parse(JSON.stringify(obj));
}

export function getById (id) {
	const tipFound = tipsConfig.find(tip => tip.id === id);
	if (tipFound) {
		return deepCopy(tipFound);
	}
}

export function getRandomOfSize (size) {
	const tipsOfSize = tipsConfig.filter(tip => tip.settings.size === size);
	if (tipsOfSize.length) {
		const randomIndex = Math.floor(Math.random() * tipsOfSize.length);
		return deepCopy(tipsOfSize[randomIndex]);
	}
}

export default getById;
