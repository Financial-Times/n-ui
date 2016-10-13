const superstore = require('superstore-sync');
const broadcast = require('n-ui/utils').broadcast;

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

function trackDismisserDisplayed (tipEl) {
	if (tipEl) {
		broadcast('oTracking.event', {
			category: 'page',
			action: 'tour-tip-dismisser',
			meta: {
				displayed: true,
				trackableString: tipEl.getAttribute('data-trackable')
			}
		});
	}
}

export default (flags, settings = {}) => {
	const flagsOff = !flags.nextFtTour || !flags.nextFtTourTipDismissers;
	const noLocalStorage = !hasLocalStorage();

	if (flagsOff || noLocalStorage || !settings.tipContainer || !settings.localStorageKey) {
		return;
	}

	// The stream pages render the tour tip multiple times, for different positioning in
	// streams across the o-grid breakpoints. There’ll only be one tip shown to the user.
	tipContainerEls = Array.from(document.querySelectorAll(settings.tipContainer));
	localStorageKey = settings.localStorageKey;

	if (!tipContainerEls.length) {
		return;
	}

	if (hasDismissed()) {
		removeTips();
	} else {
		// They’re all copies of the same tip (read comment above), so just grab first
		const tipContainerEl = tipContainerEls[0];
		const containerIsTheTip = tipContainerEl.classList.contains('tour-tip');
		const tipEl = (containerIsTheTip) ? tipContainerEl : tipContainerEl.querySelector('.tour-tip');

		setUpTipDismisser(settings.appendDismisserTo);
		trackDismisserDisplayed(tipEl);
	}
};
