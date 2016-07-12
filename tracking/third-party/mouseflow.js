import {loadScript} from '../../utils';

const getCookieValue = function (key) {
	const regex = new RegExp(`${key}=([^;]+)`, 'i');
	const a = regex.exec(document.cookie);
	return (a) ? a[1] : undefined;
}

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
			const oldSpoorId = spoorId.indexOf('-') === -1;

			if (oldSpoorId) {
				return;
			}

			const lastSegmentHex = spoorId.substring(spoorId.lastIndexOf('-') + 1);

			if (parseInt(lastSegmentHex, 16) % 10 === 0) { // 10% of everyone with a uuid-style spoor id
				enableMouseflow();
			}
		}
	}
}
