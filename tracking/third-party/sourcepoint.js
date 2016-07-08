import {broadcast} from '../../utils';

const isAllocated = function () {
	return /spoor-id=0/.test(document.cookie);
}

// Loads Sourcepoint
module.exports = function (flags) {
	if (flags && flags.get('sourcepoint') && isAllocated()) {

		document.addEventListener('sp.blocking', function () {
			broadcast('oTracking.event', {
				category: 'ads',
				action: 'blocked',
				context: {
					provider: 'sourcepoint'
				}
			});
		});

		const sp = document.createElement('script');
		sp.async = sp.defer = true;
		sp.src = 'https://h2.ft.com/static-files/sp/prod/long/sp/sp-2.js';
		sp.setAttribute('data-client-id', 'pHQAcgfacNTVtzm');
		document.body.appendChild(sp);
	}
}
