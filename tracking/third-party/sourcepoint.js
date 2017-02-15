import {broadcast} from '../../utils';

const isAllocated = () => {
	return /spoor-id=0/.test(document.cookie);
}

const event = (action) => {
	return {
		category: 'ads',
		action: action,
		context: {
			provider: 'sourcepoint'
		}
	};
};

// Loads Sourcepoint
module.exports = (flags) => {
	if (flags && flags.get('sourcepoint') && isAllocated()) {

		document.addEventListener('sp.blocking', () => {
			broadcast('oTracking.event', event('blocked'));
		});

		document.addEventListener('sp.not_blocking', () => {
			broadcast('oTracking.event', event('unblocked'));
		});

		const sp = document.createElement('script');
		sp.async = sp.defer = true;
		sp.src = 'https://h2.ft.com/static-files/sp/prod/long/sp/sp-2.js';
		sp.setAttribute('data-client-id', 'pHQAcgfacNTVtzm');
		document.body.appendChild(sp);
	}
}
