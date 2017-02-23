/*
Chartbeat (https://chartbeat.com) is a tracking service.
Originally for advertising, they've moved their suite towards editorial applications.
In this case we are only interested in the editorial; specifically the HUD (heads up display).
Eventually this will be replaced by FT's in-house "lantern" application, utilising our own data.
*/

import {cookieStore} from 'n-ui-foundations';

const loadScript = (src) => {
	return new Promise((res, err) => {
		const script = window.ftNextLoadScript(src);
		script.addEventListener('load', res);
		script.addEventListener('error', err);
	});
};

const enableChartbeat = () => {
	window._sf_async_config = {
		uid: 14181,
		domain: 'next.ft.com', // Leave this as next.ft.com, even after it changes to ft.com
		useCanonical: true
	};

	// HACK: If the user is on the front page override the path so that it is different depending on the edition.
	// Use a path that looks like the old-style FT.com front pages so that they still sort of make sense.
	if (location.pathname === '/' && document.querySelector('[data-next-edition]')) {
		window._sf_async_config.path = '/home/' + (document.querySelector('[data-next-edition]').getAttribute('data-next-edition') || '');
	}
	loadScript('//static.chartbeat.com/js/chartbeat.js');
}

// The chartbeat Heads-Up-Display (HUD) requires the chartbeat script to be loaded.
// Editorial users who wish to use the HUD will need to toggle "chartbeatHud" on.
// For non-HUD uses, load chartbeat for a random 20% of device IDs (i.e. users).
module.exports = flags => {
	if (flags.get('chartbeatHud')) {
		enableChartbeat();
	}
	else if (flags.get('chartbeat')) {
		const spoorId = cookieStore.get('spoor-id');
		const spoorNumber = spoorId.replace(/-/g, '');
		const spoorNumberTrim = spoorNumber.substring(spoorNumber.length - 12, spoorNumber.length); // Don't overflow the int
		const spoorNumberDec = parseInt(spoorNumberTrim, 16);
		if (spoorNumberDec % 100 < 20) { // 20%
			enableChartbeat();
		}
	}
}
