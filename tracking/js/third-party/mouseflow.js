import {loadScript} from '../../../utils';

const getCookieValue = function (key) {
	const regex = new RegExp(`${key}=([^;]+)`, 'i');
	const a = regex.exec(document.cookie);
	return (a) ? a[1] : undefined;
}

// Loads mouseflow tracking code
module.exports = function (flags) {

	const isSignUpApp = !!document.querySelector('html[data-next-app=signup]');

	if (flags.get('mouseflowForce')) {
		enableMouseflow();
	}
	else if (flags.get('mouseflow')) {

		if (isSignUpApp) {
				enableMouseflow();
		}
		else  {
			fetch('https://session-next.ft.com/', {
				timeout: 2000,
				credentials: 'include'
			})
			.then (function (response) {
				switch (response.status) {
					case 404:
						return {};
					case 200:
						return response.json();
					default:
						throw new Error(`${response.status} - ${response.statusTest}`);
				}
			})
			.then (function (session) {
				let isNavigationSample = parseInt(session.passportId) % 100 === 0; // 1%
				enableMouseflow();
			});
		}
	}
}

function enableMouseflow () {
	window._mfq = window._mfq || [];
	window._mfq.push(['setVariable', 'spoorId', getCookieValue('spoor-id')]);
	loadScript('https://cdn.mouseflow.com/projects/3d6fc486-2914-4efc-a5ae-35a5eac972f2.js');
}