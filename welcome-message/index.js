import {$, $$} from '../utils';
const superstore = require('superstore-sync');
const useragent = require('./useragent');
const isWebAppCapableDevice = useragent.isWebAppCapableDevice;
const isModernAndroidDevice = useragent.isModernAndroidDevice;

const STORAGE_KEY = 'n-welcome-message-seen';
const HIDDEN_CLASSNAME = 'is-hidden';

function hasLocalStorage () {
	const testKey = 'next-welcome:test-storage';
	const testValue = 'can-store';
	superstore.local.set(testKey, testValue);
	const retrievedValue = superstore.local.get(testKey);
	superstore.local.unset(testKey);
	return (testValue === retrievedValue) && superstore.isPersisting();
}

function showWebAppLink () {
	$$('.js-webapp-link').forEach(a => {
		a.pathname = location.pathname;
		a.search = location.search;
		a.classList.remove(HIDDEN_CLASSNAME);
	});
}

function showAndroidLink () {
	$$('.js-android-link').forEach(a => {
		const param = 'location=' + encodeURIComponent(location.pathname + location.search);
		a.search = a.search + (a.search.length ? '&' : '?') + param;
		a.classList.remove(HIDDEN_CLASSNAME);
	});
}

function hideOptOutLink () {
	$$('.js-optout-link').forEach(a => {
		a.classList.add(HIDDEN_CLASSNAME);
	});
}

function init () {
	const fixedEl = $('.n-welcome-message--fixed');
	const staticEl = $('.n-welcome-message--static');

	if (isWebAppCapableDevice(navigator.userAgent)) {
		showWebAppLink();
		hideOptOutLink();
	} else if (isModernAndroidDevice(navigator.userAgent)) {
		showAndroidLink();
		hideOptOutLink();
	}

	if (Boolean(superstore.local.get(STORAGE_KEY)) === false && hasLocalStorage()) {
		const closeButton = $('button', fixedEl);

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
