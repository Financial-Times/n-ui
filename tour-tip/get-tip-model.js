const tipsConfig = require('./config').sections;

function deepCopy (obj) {
	return JSON.parse(JSON.stringify(obj));
}

function getById (id) {
	const tipFound = tipsConfig.find(tip => tip.id === id);
	if (tipFound) {
		return deepCopy(tipFound);
	}
}

function getRandomOfSize (size) {
	const tipsOfSize = tipsConfig.filter(tip => tip.settings.size === size);
	if (tipsOfSize.length) {
		const randomIndex = Math.floor(Math.random() * tipsOfSize.length);
		return deepCopy(tipsOfSize[randomIndex]);
	}
}

getById.getRandomOfSize = getRandomOfSize;

module.exports = getById;
