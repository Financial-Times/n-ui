const myFtClient = require('next-myft-client');
const buttons = require('../buttons');
const superstore = require('superstore-sync');
const STORAGE_KEY = 'n-myft-digest-promo-seen';

const CLASSES = {
	ctaBtn:'.n-myft-digest-promo__cta-btn',
	dismissBtn:'.n-myft-digest-promo__dismiss-btn',
	promoComponent:'.n-myft-digest-promo',
	promoEnabled:'n-myft-digest-promo--enabled'
};

const pageBlacklist = [
	'/us-election-2016'
];

let btn;
let element;
let conceptId;

function bindListeners () {
	const btn = document.querySelector(CLASSES.ctaBtn);
	const dismissBtn = document.querySelector(CLASSES.dismissBtn);

	btn.addEventListener('click', addToDigest, false);
	dismissBtn.addEventListener('click', () => {
		hidePromo();
		setDismissState();
	}, false);
}

function shouldShowPromo (conceptId){

	if(pageBlacklist.includes(window.location.pathname)) {
		return Promise.resolve(false);
	}

	return Promise.all([
		myFtClient.get('followed', 'concept', conceptId),
		myFtClient.get('preferred', 'preference', 'email-digest')
	]).then(([follows, prefers]) => {
		return follows.length === 0 && prefers.length === 0 && !getDismissState();
})
}

function showPromo () {
	element = document.querySelector(CLASSES.promoComponent);
	element.classList.add(CLASSES.promoEnabled);
}

function hidePromo () {
	element = document.querySelector(CLASSES.promoComponent);
	element.classList.remove(CLASSES.promoEnabled);
}

function getDismissState () {
	return superstore.session.get(STORAGE_KEY);
}

function setDismissState () {
	superstore.session.set(STORAGE_KEY, 1);
}

function addToDigest () {
	const metaConcept = {
		name: btn.getAttribute('data-title'),
		taxonomy: btn.getAttribute('data-taxonomy')
	};
	const metaEmail = {
		_rel: {
			type: 'daily',
			timezone: 'Europe/London'
		}
	};

return Promise.all([
		myFtClient.add('user', null, 'followed', 'concept', conceptId, metaConcept),
		myFtClient.add('user', null, 'preferred', 'preference', 'email-digest', metaEmail)
	]).then(() => {
		buttons.toggleState(btn, true);
		btn.setAttribute('disabled', true);
	});
}

function init () {
	element = document.querySelector(CLASSES.promoComponent);
	if(!superstore.isPersisting() || !element) { return; }
	btn = document.querySelector(CLASSES.ctaBtn);
	conceptId = btn.getAttribute('data-concept-id');
	shouldShowPromo(conceptId).then(shouldShow => {
		if(shouldShow) {
			showPromo();
			bindListeners();
		}
	});
};

module.exports = { init };
