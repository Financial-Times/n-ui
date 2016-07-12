const superstore = require('superstore-sync');
const useragent = require('./useragent');
const isWebAppCapableDevice = useragent.isWebAppCapableDevice;
const isModernAndroidDevice = useragent.isModernAndroidDevice;

const STORAGE_KEY = 'n-welcome-message-seen';
const TEST_KEY = 'n-welcome-message-test';
const TEST_VAL = 'can-store';
const HIDDEN_CLASSNAME = 'is-hidden';

function hasLocalStorage () {
	superstore.local.set(TEST_KEY, TEST_VAL);
	const retrieved = superstore.local.get(TEST_KEY);
	superstore.local.unset(TEST_KEY);
	return TEST_VAL === retrieved && superstore.isPersisting();
}

function showWebAppLink () {
	Array.from(document.querySelectorAll('.js-webapp-link')).forEach(a => {
		a.pathname = location.pathname;
		a.search = location.search;
		a.classList.remove(HIDDEN_CLASSNAME);
	});
}

function showAndroidLink () {
	Array.from(document.querySelectorAll('.js-android-link')).forEach(a => {
		const param = 'location=' + encodeURIComponent(location.pathname + location.search);
		a.search = a.search + (a.search.length ? '&' : '?') + param;
		a.classList.remove(HIDDEN_CLASSNAME);
	});
}

function hideOptOutLink () {
	Array.from(document.querySelectorAll('.js-optout-link')).forEach(a => {
		a.classList.add(HIDDEN_CLASSNAME);
	});
}

function init () {
	const fixedEl = document.querySelector('.n-welcome-message--fixed');
	const staticEl = document.querySelector('.n-welcome-message--static');

	if (isWebAppCapableDevice(navigator.userAgent)) {
		showWebAppLink();
		hideOptOutLink();
	} else if (isModernAndroidDevice(navigator.userAgent)) {
		showAndroidLink();
		hideOptOutLink();
	}

	if (Boolean(superstore.local.get(STORAGE_KEY)) === false && hasLocalStorage()) {
		const closeButton = fixedEl.querySelector('button');

		closeButton.onclick = function () {
			fixedEl.classList.add(HIDDEN_CLASSNAME);
		};

		fixedEl.classList.remove(HIDDEN_CLASSNAME);
		staticEl.classList.add(HIDDEN_CLASSNAME);

		// only display the bar the first time
		superstore.local.set(STORAGE_KEY, 1);
	}
};

module.exports = { init };
