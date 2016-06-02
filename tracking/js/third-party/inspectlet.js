import {loadScript} from '../../../utils';

const getSessionToken = function () {
	const s = /FTSession=([^;]+)/i.exec(document.cookie);
	return (s) ? s[1] : undefined;
}

const getAllocationId = function () {
	const a = /FTAllocation=([^;]+)/i.exec(document.cookie);
	return (a) ? a[1] : undefined;
}

// Loads session cam tracking code
module.exports = function (flags) {

	const isSignUpApp = !!document.querySelector("html[data-next-app=signup]");

	// inspectletForce is needed for staff etc. as we'll need to force it on for testing
	if (flags && (
		flags.get('inspectletForce') ||
		(flags.get('inspectlet') && isSignUpApp))
	) {

		fetch('https://ammit-api.ft.com/segment', {
			timeout: 2000,
			credentials: 'include',
			headers: {
				'ft-session-token': getSessionToken(),
				'ft-allocation-id': getAllocationId()
			}
		}).then(function (res) {

				if (!res) {
					return;
				}

				let allocation = res.headers.get('x-ft-ab');

				window.__insp = window.__insp || [];
				window.__insp.push(['wid', 1422358241]);
				window.__insp.push(['identify', getAllocationId()]);

				// frontpage:control,moreon:variant -> { frontpage: 'control', moreon: 'variant' }
				let ammit = {};
				if (allocation) {
					allocation.split(',').forEach(function (test) {
						let a = test.split(':');
						ammit[a[0]] = a[1];
					});
					window.__insp.push(['tagSession', ammit]);
				}


				return loadScript('//cdn.inspectlet.com/inspectlet.js');

			}).catch(function (err) { console.log(err); /* swallow the error for now FIXME */ })
	}
}
