const utils = require('./utils');
const sandbox = require('./sandbox');
const oTrackingCore = require('o-tracking/src/javascript/core.js');
const extend = require('o-ads').utils.extend;
const apiUrlRoot = 'https://ads-api.ft.com/v1/';

module.exports = function (flags, appName, adOptions) {

	adOptions = adOptions || {};

	const targetingOptions = {
		pt: appName.toLowerCase().substr(0, 3),
		nlayout: utils.getLayoutName(),
		mvt: utils.getABTestState(),
		rootid: oTrackingCore.getRootID()
	};

	if (flags.get('adsEnableTestCreatives')) {
		targetingOptions.testads = true;
	}

	// TO-DO: Check if we can get rid of this 'extend' and pass an object literal
	let targeting = extend(targetingOptions);

	// This is a beta feature from google to enable long lived pageview data.
	// This is needed for master companion ads when there could be ads out of view further down the page
	if (appName === 'article') {
		targeting['gpt-beta'] = 'hzwxrfqd';
	}

	const kruxConfig = (flags.get('krux')) && !adOptions.noTargeting && {
		id: 'KHUSeE3x',
		attributes: {
			user: {},
			page: {
				rootid: oTrackingCore.getRootID()
			}
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
	}


	function getZone () {
		let zone = [ utils.getMetaData('dfp_site'), utils.getMetaData('dfp_zone') ].filter( a => a );
		if(!zone.length) {
			zone = ['unclassified'];
		}
		return zone.join('/');
	}

	function getGptRenderingMode () {
		// (SRA) is a rendering mode available in the GPT library to request ads in a single call.
		if (flags.get('enableAdsSRA')) {
			return 'sra';
		}

		// defaults to o-ads settings
		return null;
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
			zone: getZone(),
			rendering: getGptRenderingMode()
		},
		formats: {
			PaidPost: {
				sizes: 'fluid'
			},
			OneByOne: {
				sizes: [1,1]
			},
			Outstream: {
				sizes: [1,1]
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
		disableConsentCookie: flags.get('adsDisableCookieConsent'),
		validateAdsTraffic: flags.get('moatAdsTraffic')
	};
};
