// Loads Google Floodlight
module.exports = function (flags) {

	const isAnonymous = !/FTSession/.test(document.cookie);
	const spoorId = /spoor-id=([^;]+)/.exec(document.cookie);
	const host = 'https://4235225.fls.doubleclick.net/activityi;src=4235225';

	// sign-up attributes
	const c = document.querySelector(['data-signup-country']);
	const t = document.querySelector(['data-signup-term']);
	const o = document.querySelector(['data-signup-offer']);

	const country = (c) ? c.getAttribute('data-signup-country') : undefined;
	const term = (t) ? c.getAttribute('data-signup-term') : undefined;
	const offer = (o) ? c.getAttribute('data-signup-offer') : undefined;

	// sign-up funnel flags
	const isSignUpForm = /^\/signup/.test(location.pathname);
	const isSubscriptionConfirmation = /^\/thank-you/.test(location.pathname);
	const isTrialConfirmation = /(4998d861-8960-a8d1-3738-eae97bcd07a2|41218b9e-c8ae-c934-43ad-71b13fcb4465)/.test(offer);

	const spoor = (spoorId) ? spoorId[1] : '';
	const ts = Date.now();

	const addPixel = (src) => {
		const i = new Image();
		i.src = src;
	};

	if (flags && (flags.get('floodlight') && spoorId)) {

		if (isSignUpForm) {
			addPixel(`${host};type=signu107;cat=ft-ne00;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=${ts}`);
		} else if (isSubscriptionConfirmation) {
			addPixel(`${host};type=trans658;cat=ft-ne0;qty=1;u5=${offer};u7=${country};u8=${term};u10=${spoor};dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=${ts}`);
		} else if (isTrialConfirmation) {
			addPixel(`${host};type=trans658;cat=ft-ne00;qty=1;u5=${offer};u7=${country};u8=${term};u10=${spoor};dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=${ts}`);
		} else if (isAnonymous) {
			addPixel(`${host};type=homeo886;cat=ft-ne000;u10=${spoor};dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=${ts};num=1`);
			// iNewTest is for a temporary tracking tag to test whether it's the tracking tag that's not working.
			// Should it be the original tag that was the problem, the current `cat=ft-ne000` should be replaced with `cat=ft-ne003`.
			const iNewTest = new Image();
			iNewTest.src = `${host};type=homeo886;cat=ft-ne003;u10=${spoor};dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;ord=${ts};num=1`;
		}
	}
};
