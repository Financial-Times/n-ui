/*
Chartbeat (https://chartbeat.com) is a tracking service.
Originally for advertising, they've moved their suite towards editorial applications.
In this case we are only interested in the editorial; specifically the HUD (heads up display).
Eventually this will be replaced by FT's in-house "lantern" application, utilising our own data.
*/

import {loadScript} from '../../utils';

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
// For non-HUD uses, load chartbeat for a random 20% of page views.
module.exports = flags => {
	if (flags && (flags.get('chartbeat') || flags.get('chartbeatHud'))) {
		if (flags.get('chartbeatHud') || Math.random() < 0.2) {
			enableChartbeat();
			return;
		}
	}
}
