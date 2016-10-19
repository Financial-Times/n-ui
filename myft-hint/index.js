const hint = document.querySelector('.myft-hint');
const superstore = require('superstore-sync');
const STORAGE_KEY = 'myft-hint-shown-count';
const MAX_SHOWS = 3

function shouldShowHint (){
	return getHintShownCount() <= MAX_SHOWS;
		//stream and article pages - flag, regex,- check url path for [/^\/(stream.*)|(article.*)/i]
};

function showHint () {
	hint.classList.add('myft-hint__show');
};

function getHintShownCount () {
	return superstore.local.get(STORAGE_KEY);
}

function setHintShownCount (count) {
	superstore.local.set(STORAGE_KEY, count);
}

function incrementHintShownCount () {
	//if no STORAGE_KEY, setHintSHownCount
	let count = getHintShownCount();
	setHintShownCount(count++);
	// superstore.session.set(STORAGE_KEY++);
}

function init () {
	if(!superstore.isPersisting() || !hint) { return; }
	if(shouldShowHint) {
		showHint();
		incrementHintShownCount();
	}
};

module.exports = { init };
