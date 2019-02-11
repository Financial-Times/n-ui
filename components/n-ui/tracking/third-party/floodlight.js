// Loads Google Floodlight
module.exports = function (flags) {

	const isAnonymous = !/FTSession/.test(document.cookie);
	const spoorId = /spoor-id=([^;]+)/.exec(document.cookie);
	const host = 'https://4235225.fls.doubleclick.net/activityi;src=4235225';

	// sign-up attributes
	const c = document.querySelector('[data-signup-country]');
	const t = document.querySelector('[data-signup-term]');
	const o = document.querySelector('[data-signup-offer]');
	const l = document.querySelector('[data-signup-is-trial]');

	const country = (c) ? c.getAttribute('data-signup-country') : undefined;
	const term = (t) ? c.getAttribute('data-signup-term') : undefined;
	const offer = (o) ? c.getAttribute('data-signup-offer') : undefined;

	// sign-up funnel flags
	const isSignUpForm = /^\/signup/.test(location.pathname);
	const isSubscriptionConfirmation = /^\/thank-you/.test(location.pathname);
	const isTrialConfirmation = (l) ? l.getAttribute('data-signup-is-trial') === 'true' : undefined;
	const isBarrier = !!document.querySelector('[data-trackable="page:product"]');
	const isSubscriber = window.FT.flags.subscriberCohort;
	const isRegistered = !isAnonymous && !isSubscriber;

	const spoor = (spoorId) ? spoorId[1] : '';
	const ts = Date.now();

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

	const addPixel = (src) => {
		const i = new Image();
		i.src = src;

		customTrackingEvent({ source: src });
	};

	const gtagEvent = (sendTo) => {
		window.gtag('event', 'conversion', {
			'allow_custom_scripts': true,
			'u1': '[u10]',
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
			addPixel(`${host};type=signu107;cat=ft-ne00;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=${ts}`);
			gtagEvent('DC-9073629/ftsig0/ftmem0+standard');
		} else if (isTrialConfirmation) {
			addPixel(`${host};type=trans658;cat=ft-ne00;qty=1;u5=${offer};u7=${country};u8=${term};u10=${spoor};dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=${ts}`);
			gtagEvent('DC-9073629/ftcon00/fttri0+standard');
		} else if (isSubscriptionConfirmation) {
			addPixel(`${host};type=trans658;cat=ft-ne0;qty=1;u5=${offer};u7=${country};u8=${term};u10=${spoor};dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=${ts}`);
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
			addPixel(`${host};type=homeo886;cat=ft-ne000;u10=${spoor};dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=${ts};num=1`);
			gtagEvent('DC-9073629/ftrem0/ftsit0+standard');
		}
	}
};
