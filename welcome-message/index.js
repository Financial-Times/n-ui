const superstore = require('superstore-sync');

import { $ } from '../utils';

const STORAGE_KEY = 'n-welcome-message-seen';
const TEST_KEY = 'n-welcome-message-test';
const TEST_VAL = 'can-store';

function hasLocalStorage () {
	superstore.local.set(TEST_KEY, TEST_VAL);
	const retrieved = superstore.local.get(TEST_KEY);
	superstore.local.unset(TEST_KEY);
	return TEST_VAL === retrieved && superstore.isPersisting();
}

function init () {
	const fixedEl = $('.n-welcome-message--fixed');
	const staticEl = $('.n-welcome-message--static');

	const segmentId = String(document.cookie).match(/(?:^|;)\s*segmentID=/);
	if (segmentId) {
		if (hasLocalStorage()) {
			superstore.local.set(STORAGE_KEY, 1);
		}
		fixedEl.hidden = true;
		staticEl.hidden = true;
	}

	if (Boolean(superstore.local.get(STORAGE_KEY)) === false && hasLocalStorage()) {
		const closeButton = $('button', fixedEl);

		closeButton.onclick = function () {
			fixedEl.hidden = true;
		};

		fixedEl.hidden = false;
		staticEl.hidden = true;

		// only display the bar the first time
		superstore.local.set(STORAGE_KEY, 1);
	}
};

module.exports = { init };
