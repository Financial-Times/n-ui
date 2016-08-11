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

function addReferrerToOptoutLink () {
	$$('.js-optout-link').forEach(a => {
		const param = 'referrer=' + encodeURIComponent(location.href);
		a.search = a.search + (a.search.length ? '&' : '?') + param;
	});
}

function init () {
	if (useragent.isWebAppCapableDevice(navigator.userAgent)) {
		showWebAppLink();
	} else if (useragent.isModernAndroidDevice(navigator.userAgent)) {
		showAndroidLink();
	}
	addReferrerToOptoutLink();
}

module.exports = { init };
