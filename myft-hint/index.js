const hint = document.querySelector('.myft-hint');
const superstore = require('superstore-sync');
const STORAGE_KEY = 'myft-hint-shown-count';
const MAX_SHOWS = 3

function shouldShowHint (){
	return getHintShownCount() < MAX_SHOWS;
};

function showHint () {
	hint.classList.add('myft-hint__show');
};

function getHintShownCount () {
	return superstore.local.get(STORAGE_KEY) || 0;
}

function setHintShownCount (count) {
	superstore.local.set(STORAGE_KEY, count);
}

function incrementHintShownCount () {
	let count = getHintShownCount();
	setHintShownCount(count+1);
}

function init () {
	if(!superstore.isPersisting() || !hint) { return; }
	if(shouldShowHint()) {
		showHint();
		incrementHintShownCount();
	}
};

module.exports = { init };
