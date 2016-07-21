/*
Chartbeat (https://chartbeat.com) is a tracking service.
Originally for advertising, they've moved their suite towards editorial applications.
In this case we are only interested in the editorial; specifically the HUD (heads up display).
Eventually this will be replaced by FT's in-house "lantern" application, utilising our own data.
*/

import {loadScript} from '../../utils';

const getCookieValue = key => {
	const regex = new RegExp(`${key}=([^;]+)`, 'i');
	const a = regex.exec(document.cookie);
	return (a) ? a[1] : undefined;
}

const enableChartbeat = () => {
	window._sf_async_config = {
		uid: 14181,
		domain: 'next.ft.com', // Leave this as next.ft.com, even after it changes to ft.com
		useCanonical: true
	};
	loadScript('//static.chartbeat.com/js/chartbeat.js');
}

// The chartbeat Heads-Up-Display (HUD) requires the chartbeat script to be loaded.
// Editorial users who wish to use the HUD will need to toggle "chartbeatHud" on.
// For non-HUD uses, load chartbeat for a cohort of spoor IDs.
module.exports = flags => {
	if (flags && (flags.get('chartbeat') || flags.get('chartbeatHud'))) {
		if (flags.get('chartbeatHud')) {
			enableChartbeat();
			return;
		}

		// E.g. `spoorIdCohort = { min:0, max:99 }` is a 100% cohort.
		// Note: Arbitrarily decided on this cohort, merely so it's
		// less likely to correspond with other third-party-scripts.
		const spoorIdCohort = { min:60, max:80 };

		const spoorId = getCookieValue('spoor-id');
		if (spoorId.indexOf('-') === -1) return; // Only accept uuid-format spoor ids

		const lastSegmentHex = spoorId.substring(spoorId.lastIndexOf('-') + 1);
		const lastSegmentPercentoid = parseInt(lastSegmentHex, 16) % 100 // Always a number from 0 to 99

		// Other trackers also cohort based on spoorId. So bump this cohort up by 10%
		if (lastSegmentPercentoid >= spoorIdCohort.min && lastSegmentPercentoid <= spoorIdCohort.max) {
			enableChartbeat();
		}
	}
}
