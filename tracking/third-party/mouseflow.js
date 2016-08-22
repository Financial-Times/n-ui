import {loadScript, getCookieValue} from '../../utils';

function enableMouseflow () {
	window._mfq = window._mfq || [];
	window._mfq.push(['setVariable', 'spoorId', getCookieValue('spoor-id')]);
	loadScript('https://cdn.mouseflow.com/projects/3d6fc486-2914-4efc-a5ae-35a5eac972f2.js');
}

// Loads mouseflow tracking code
module.exports = function (flags) {

	const isAutomatedTest = window.location.href.indexOf('backend') !== -1;
	const isSignUpApp = !!document.querySelector('html[data-next-app=signup]') && !isAutomatedTest;
	const hasLightSignup = !!document.querySelector('.o-email-only-signup');

	if (flags.get('mouseflowForce')) {
		enableMouseflow();
	}
	else if (flags.get('mouseflow')) {

		if (isSignUpApp || hasLightSignup) {
			enableMouseflow();
		}
		else {
			const spoorId = getCookieValue('spoor-id');
			const spoorNumber = spoorId.replace(/-/g, '');
			const spoorNumberTrim = spoorNumber.substring(spoorNumber.length - 12, spoorNumber.length); // Don't overflow the int
			const spoorNumberDec = parseInt(spoorNumberTrim, 16)

			if (spoorNumberDec % 100 === 0) { // 1%
				enableMouseflow();
			}
		}
	}
}
