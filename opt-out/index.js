import { $$ } from '../utils';

const IOS_DEVICE_REGEX = /OS (7|8|9|10).* like Mac OS X.*/i;
const ANDROID_DEVICE_REGEX = /Android (4\.[3-9]|[5-9])/i;

function isWebAppCapableDevice (userAgent) {
	return IOS_DEVICE_REGEX.test(userAgent);
}

function isModernAndroidDevice (userAgent) {
	return ANDROID_DEVICE_REGEX.test(userAgent);
}

function showWebAppLink () {
	$$('.js-webapp-link').forEach(a => {
		a.pathname = location.pathname;
		a.search = location.search;
		a.hidden = false;
	});
}

function showAndroidLink () {
	$$('.js-android-link').forEach(a => {
		const param = 'location=' + encodeURIComponent(location.pathname + location.search);
		a.search = a.search + (a.search.length ? '&' : '?') + param;
		a.hidden = false;
	});
}

function init () {
	if (isWebAppCapableDevice(navigator.userAgent)) {
		showWebAppLink();
	} else if (isModernAndroidDevice(navigator.userAgent)) {
		showAndroidLink();
	}
}

module.exports = {
	init,
	isWebAppCapableDevice,
	isModernAndroidDevice
};
