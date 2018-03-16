const utils = require('./utils');
const sandbox = require('./sandbox');
const extend = require('o-ads').utils.extend;
const apiUrlRoot = 'https://ads-api.ft.com/v1/';

module.exports = function (flags, appName, adOptions) {
	adOptions = adOptions || {};

	const targeting = extend({
		pt: appName.toLowerCase().substr(0, 3),
		nlayout: utils.getLayoutName(),
		mvt: utils.getABTestState()
	});


	const kruxConfig = (flags.get('krux')) && !adOptions.noTargeting && {
		id: 'KHUSeE3x',
		attributes: {
			user: {},
			page: {}
		}
	};

	const validateAdsTrafficApi = (flags.get('validateAdsTraffic')) ? `${apiUrlRoot}validate-traffic` : null;

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
	}


	function getZone () {
		let zone = [ utils.getMetaData('dfp_site'), utils.getMetaData('dfp_zone') ].filter( a => a );
		if(!zone.length) {
			zone = ['unclassified'];
		}
		return zone.join('/');
	}

	function getLazyLoadConfig () {
		// Switch off lazy loading in Q4.
		if(/^front/.test(appName) && flags.get('noLazyLoadingFrontPage')) {
			return false;
		}
		else {
			return {
				viewportMargin: getViewportMargin()
			};
		}
	}

	function getViewportMargin () {
		let viewportMargin = '0%';
		let pt = appName;
		let scrnSize = utils.getScreenSize();
		if (scrnSize < 980 && !/^article/.test(pt)) {
			if (/^front/.test(pt)) {
				if (scrnSize < 760) {viewportMargin = '15%';}
				else {viewportMargin ='5%';}
			}
			if (/^stream/.test(pt)){
				if (scrnSize < 760) {viewportMargin ='5%';}
				else {viewportMargin = '15%';}
			}
		}
		return viewportMargin;
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
		lazyLoad: getLazyLoadConfig(),
		targetingApi: adOptions.noTargeting ? null : {
			user: `${apiUrlRoot}user`,
			page: getContextualTargeting(appName),
			usePageZone: true
		},
		validateAdsTrafficApi
	};

};
