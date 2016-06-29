const superstore = require('superstore-sync');

const STORAGE_KEY = 'n-welcome-message-seen';
const HIDDEN_CLASSNAME = 'is-hidden';
const IOS_DEVICE_REGEX = /OS [0-9]{1,2}(_[0-9]){1,2} like Mac OS X/i;
const ANDROID_DEVICE_REGEX = /Android (\d+(?:\.\d+)+)/i;

function isWebAppCapableDevice (userAgent) {
	return IOS_DEVICE_REGEX.test(userAgent);
}

function isModernAndroidDevice (userAgent) {
	const results = ANDROID_DEVICE_REGEX.exec(userAgent);

	if (!results) {
		return false;
	}

	const version = results[1].split('.').map(a => parseInt(a, 10));

	if (version[0] > 4) {
		return true;
	} else if(version[0] === 4 && version[1] > 2) {
		return true;
	} else {
		return false;
	}
}

function hasLocalStorage () {
	const testKey = 'next-welcome:test-storage';
	const testValue = 'can-store';
	superstore.local.set(testKey, testValue);
	const retrievedValue = superstore.local.get(testKey);
	superstore.local.unset(testKey);
	return (testValue === retrievedValue) && superstore.isPersisting();
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
