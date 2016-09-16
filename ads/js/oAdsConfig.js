const utils = require('./utils');
const sandbox = require('./sandbox');
const extend = require('o-ads').utils.extend;
const apiUrlRoot = 'https://ads-api.ft.com/v1/'

function getLazyLoadConfig (flags) {
	switch(flags.adsLazyLoadPosition) {
		case 'onload':
			return false;
		case '50pc':
			return { viewportMargin: '50% 0%' };
		case '100pc':
			return { viewportMargin: '100% 0%' };
		default:
			return { viewportMargin: '0%' };
	}
}

module.exports = function (flags) {
	const pageType = utils.getAppName();
	const eidMatch = document.cookie.match(/EID=(\d+)/);

	//Temporarily get EID from FT_U cookie until all ad systems stop using it
	const userCookieMetadata = {
		eid: eidMatch && eidMatch.length > 1 ? eidMatch[1] : null
	};

	const targeting = extend({
		pt: pageType.toLowerCase().substr(0, 3),
		nlayout: utils.getLayoutName()
	}, userCookieMetadata);


	const kruxConfig = (flags.get('krux')) && {
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
			uuid = document.querySelector('[data-content-id]').getAttribute('data-content-id');

			const referrer = utils.getReferrer();
			url = `${apiUrlRoot}content/${uuid}`;
			if(referrer) {
				url += `?referrer=${encodeURIComponent(referrer.split(/[?#]/)[0])}`;
			}
		} else if (appName === 'stream-page') {
			uuid = document.querySelector('[data-concept-id]').getAttribute('data-concept-id');
			url = `${apiUrlRoot}concept/${uuid}`;
		}

		return url;
	};

	function getZone() {
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
		krux: kruxConfig,
		collapseEmpty: 'before',
		dfp_targeting: utils.keyValueString(targeting),
		lazyLoad: getLazyLoadConfig(flags),
		targetingApi: {
			user: `${apiUrlRoot}user`,
			page: getContextualTargeting(pageType),
			usePageZone: true
		}
	};

};
