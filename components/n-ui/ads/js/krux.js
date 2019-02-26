const Superstore = require('superstore');
const store = new Superstore('session', 'next-krux');
const oAds = require('@financial-times/o-ads');

const addPixel = (src) => {
	const img = new Image();
	img.src = src;
};

// None of the Krux scripts need to run all the time since they are just matching users between various systems
// In Supertag they were (mostly) set to cap at 3 times a day. So roughly equating that to 2 times a session.

const frequencyCap = (name, limit, fn) => {
	const key = `scriptExecCount_${name}`;
	store.get(key).then(val => {
		val = val || 0;
		if(parseInt(val) < limit) {
			fn();
			store.set(key, ++val).catch(() => {});
		}
	}).catch(() => {});
};

exports.init = (flags) => {

	document.body.addEventListener('oAds.kruxScriptLoaded', () => {
		//If local/sessionStorage unavailable, don't run any of these scripts.
		if(typeof window.Krux === 'undefined' || !Superstore.isPersisting()) {
			return;
		}

		const kuid = oAds.krux.retrieve('kuid');

		if(kuid && typeof kuid !== 'undefined') {

			// DoubleClick handles display advertising. This matches up the user ID formats so Krux can send segment populations to them.
			if(flags.get('kruxGoogleIntegration')) {
			frequencyCap('doubleclick', 2, () => { addPixel('https://usermatch.krxd.net/um/v2?partner=google'); });
			}

			// The following four scripts are user matching scripts for Kruxdata partners
			// They provide 3rd party data on user Demographic (eg:	Males),	Intent	(eg:	Children's	Apparel	Buyers)
			if(flags.get('kruxAcxiomIntegration')) {
				frequencyCap('acxiom', 2, () => { addPixel(`https://idsync.rlcdn.com/379708.gif?partner=${kuid}`); });
			}

			if(flags.get('kruxExelateIntegration')) {
				frequencyCap('exelate', 2, () => {
					addPixel(`https://loadm.exelator.com/load?_kdpid=e4942ff0-4070-4896-a7ef-e6a5a30ce9f9&buid=${kuid}&p=204&g=270&j=0`);
				});
			}
		}

	});
};
