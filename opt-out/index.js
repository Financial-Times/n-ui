import useragent from './useragent';
import { $$ } from '../utils';

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
	$$('.js-optout-link').forEach(a => {
		const referrer = encodeURIComponent(location.pathname);
		a.href += `?referrer=${referrer}`;
	});
	if (useragent.isWebAppCapableDevice(navigator.userAgent)) {
		showWebAppLink();
	} else if (useragent.isModernAndroidDevice(navigator.userAgent)) {
		showAndroidLink();
	}
}

module.exports = { init };
