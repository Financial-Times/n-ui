const utils = require('./utils');
const sandbox = require('./sandbox');
const extend = require('o-ads').utils.extend;
const apiUrlRoot = 'https://ads-api.ft.com/v1/'

module.exports = function (flags, appName, adOptions) {
	adOptions = adOptions || {};
	const eidMatch = document.cookie.match(/EID=(\d+)/);

	//Temporarily get EID from FT_U cookie until all ad systems stop using it
	const userCookieMetadata = {
		eid: eidMatch && eidMatch.length > 1 ? eidMatch[1] : null
	};

	const targeting = extend({
		pt: appName.toLowerCase().substr(0, 3),
		nlayout: utils.getLayoutName(),
		mvt: utils.getABTestState()
	}, userCookieMetadata);


	const kruxConfig = (flags.get('krux')) && !adOptions.noTargeting && {
		id: 'KHUSeE3x',
		attributes: {
			user: userCookieMetadata,
			page: {}
		}
	};

	function getContextualTargeting (appName) {
		let uuid;
		let url;
		const apiUrlRoot = 'https://ads-api.ft.com/v1/';
		if (appName === 'article') {
			uuid = document.documentElement.getAttribute('data-content-id');

			const referrer = utils.getReferrer();
			url = `${apiUrlRoot}content/${uuid}`;
			if(referrer) {
				url += `?referrer=${encodeURIComponent(referrer.split(/[?#]/)[0])}`;
			}
		} else if (appName === 'stream-page') {
			uuid = document.documentElement.getAttribute('data-concept-id');
			url = `${apiUrlRoot}concept/${uuid}`;
		}

		return url;
	};

	function getZone () {
		let zone = [ utils.getMetaData('dfp_site'), utils.getMetaData('dfp_zone') ].filter( a => a );
		if(!zone.length) {
			zone = ['unclassified'];
		}
		return zone.join('/');
	}

	return {
		gpt: {
			network: '5887',
			site: sandbox.isActive() ? 'sandbox.next.ft' :'ft.com',
			zone: getZone()
		},
		formats: {
			PaidPost: {
				sizes: 'fluid'
			}
		},
		responsive: {
			extra: [1025, 0], //Reasonable width to show a Billboard (desktop)
			large: [980, 0], //reasonable width to show SuperLeaderboard (tablet landscape)
			medium: [760, 0], //reasonable width to show a leaderboard (tablet portrait)
			small: [0, 0] //Mobile
		},
		krux: kruxConfig,
		collapseEmpty: 'before',
		dfp_targeting: utils.keyValueString(targeting),
		lazyLoad: { viewportMargin: '0%' },
		targetingApi: adOptions.noTargeting ? null : {
			user: `${apiUrlRoot}user`,
			page: getContextualTargeting(appName),
			usePageZone: true
		}
	};

};
