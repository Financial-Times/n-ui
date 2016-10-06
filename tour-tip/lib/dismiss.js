const superstore = require('superstore-sync');

let dismisserButtons = [];
let tipContainerEls;
let localStorageKey;

function hasLocalStorage () {
	const TEST_KEY = 'tour-tip-test';
	const TEST_VAL = 'can-store';

	superstore.local.set(TEST_KEY, TEST_VAL);
	const retrieved = superstore.local.get(TEST_KEY);
	superstore.local.unset(TEST_KEY);
	return TEST_VAL === retrieved && superstore.isPersisting();
}

function hasDismissed () {
	return Boolean(superstore.local.get(localStorageKey));
}

function removeTips () {
	tipContainerEls.forEach(el => el.remove());
}

function dismissTip () {
	superstore.local.set(localStorageKey, 1);
	dismisserButtons.forEach(button => button.removeEventListener('click', dismissTip));
	removeTips();
}

function createDismisserButton () {
	const button = document.createElement('button');

	button.innerHTML = '<span class="o-buttons-icon__label">Dismiss tips on this page</span>';
	button.className = 'tour-tip__dismiss-btn o-buttons-icon o-buttons-icon--icon-only';
	button.setAttribute('data-trackable', 'dismiss');
	button.setAttribute('title', 'Dismiss tips on this page');

	return button;
}

function setUpTipDismisser (appendDismisserTo) {
	const dismisserContainers = Array.from(document.querySelectorAll(appendDismisserTo));
	const dismisserButton = createDismisserButton();

	dismisserButtons = dismisserContainers.map(container => {
		const button = dismisserButton.cloneNode();
		button.addEventListener('click', dismissTip);

		container.appendChild(button);

		return button;
	});
}

export default (flags, settings = {}) => {
	const flagsOff = !flags.nextFtTour || !flags.nextFtTourTipDismissers;
	const noLocalStorage = !hasLocalStorage();

	if (flagsOff || noLocalStorage || !settings.tipContainer || !settings.localStorageKey) {
		return;
	}

	tipContainerEls = Array.from(document.querySelectorAll(settings.tipContainer));
	localStorageKey = settings.localStorageKey;

	if (tipContainerEls.length) {
		if (hasDismissed()) {
			removeTips();
		} else {
			setUpTipDismisser(settings.appendDismisserTo);
		}
	}
};
