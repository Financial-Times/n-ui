// Loads Google Floodlight
module.exports = function (flags) {

	const isAnonymous = !/FTSession/.test(document.cookie);
	const spoor = /spoor-id=([^;]+)/.exec(document.cookie);
	const spoorId = (spoor && spoor.length > 0) ? spoor[1] : '';

	// sign-up attributes
	const $trial = document.querySelector('[data-signup-is-trial]');

	// sign-up funnel flags
	const isSignUpForm = /^\/signup/.test(location.pathname);
	const isSubscriptionConfirmation = /^\/thank-you/.test(location.pathname);
	const isTrialConfirmation = ($trial) ? $trial.getAttribute('data-signup-is-trial') === 'true' : undefined;
	const isBarrier = !!document.querySelector('[data-trackable="page:product"]');
	const isSubscriber = window.FT.flags.subscriberCohort;
	const isRegistered = !isAnonymous && !isSubscriber;

	// NOTE: this is sometimes referred to as NGDA
	const customTrackingEvent = (data) => {
		let event = new CustomEvent('oTracking.event', {
			detail: {
				category: 'marketing-floodlight',
				action: 'fired',
				data
			},
			bubbles: true
		});
		document.body.dispatchEvent(event);
	};

	const gtagEvent = (sendTo) => {
		window.gtag('event', 'conversion', {
			'allow_custom_scripts': true,
			'u1': '[u10]',
			'u10': spoorId,
			'send_to': sendTo
		});
		// Fix a11y issue with this iframe not having a title element.
		const iframes = document.querySelectorAll('iframe[src*="doubleclick.net"]');
		for (let i = 0; i < iframes.length; i++) {
			iframes[i].setAttribute('aria-hidden', true);
		}
	};

	if (flags && (flags.get('floodlight') && spoorId)) {
		if (isSignUpForm) {
			gtagEvent('DC-9073629/ftsig0/ftmem0+standard');
		} else if (isTrialConfirmation) {
			gtagEvent('DC-9073629/ftcon00/fttri0+standard');
		} else if (isSubscriptionConfirmation) {
			gtagEvent('DC-9073629/ftcon0/ftsub0+standard');
		} else if (isBarrier) {
			gtagEvent('DC-9073629/ftbar0/ftlan0+standard');
			// Note: move this call into the `gtagEvent` call when removing the old code.
			customTrackingEvent();
		} else if (isSubscriber) {
			gtagEvent('DC-9073629/ftsub0/ftlog0+standard');
			customTrackingEvent();
		} else if (isRegistered) {
			gtagEvent('DC-9073629/ftreg0/ftlog0+standard');
			customTrackingEvent();
		} else if (isAnonymous) {
			gtagEvent('DC-9073629/ftrem0/ftsit0+standard');
		}
	}
};
