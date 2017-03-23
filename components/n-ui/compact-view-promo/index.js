const superstore = require('superstore-sync');

const HAS_MINIMIZED = 'n-welcome-message-compact-ad-collapsed';
const TEST_KEY = 'n-welcome-message-test';
const TEST_VAL = 'can-store';

let fixedEl;
let staticEl;

function hasLocalStorage () {
	superstore.local.set(TEST_KEY, TEST_VAL);
	const retrieved = superstore.local.get(TEST_KEY);
	superstore.local.unset(TEST_KEY);
	return TEST_VAL === retrieved && superstore.isPersisting();
}

function hideSticky () {
	fixedEl.hidden = true;
	staticEl.hidden = false;
	superstore.local.set(HAS_MINIMIZED, 1);
}

function showSticky (){
	fixedEl.hidden = false;
	staticEl.hidden = true;
}

function init () {
	if (!hasLocalStorage()) {
		return;
	}
	fixedEl = document.querySelector('.n-welcome-message--fixed');
	staticEl = document.querySelector('.n-welcome-message--static');

	// only show the sticky banner thrice
	const viewCount = superstore.local.get('n-welcome-message-ad-view-count') || 0;

	if (viewCount >= 3 || superstore.local.get(HAS_MINIMIZED)) {
		hideSticky();
	} else {
		superstore.local.set('n-welcome-message-ad-view-count', viewCount + 1);
		const closeButton = fixedEl.querySelector('.n-welcome-banner__button--close');
		const primaryCTA = fixedEl.querySelector('.n-welcome-banner__button--primary');
		closeButton.onclick = hideSticky;
		primaryCTA.onclick = hideSticky;
		showSticky();
	}
};

module.exports = { init };
