const hint = document.querySelector('.myft-hint');
const superstore = require('superstore-sync');
const myftClient = require('next-myft-client');
const STORAGE_KEY = 'myft-hint-shown-count';
const MAX_SHOWS = 3;

function shouldShowHint () {
	// The hint should be shown if the user is not subscribed to any myFT topics
	// and the MAX shows value hasn't been reached.
	const showCountBelowMax = getHintShownCount() < MAX_SHOWS;
	if(!showCountBelowMax) { return Promise.resolve();}

	return myftClient.getAll('followed', 'concept')
		.then(function (userConcepts) {
			const noConceptsAdded = !(userConcepts.length > 0);
			return noConceptsAdded;
		});
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
	const count = getHintShownCount();
	setHintShownCount(count+1);
}

function init () {
	if(!superstore.isPersisting() || !hint) { return; }
	shouldShowHint().then(function (show) {
		if(show){
			showHint();
			incrementHintShownCount();
		}
	});
};


module.exports = { init };
