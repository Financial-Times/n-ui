const krux = require('./js/krux');
const Ads = window.oAds = require('o-ads');
// TODO move to central shared utils
const utils = require('./js/utils');
const oAdsConfig = require('./js/oAdsConfig');
const Reporter = require('./js/reporter');
const sendMetrics = require('./js/metrics');
const Sticky = require('./js/sticky');

import { perfMark } from '../utils'

let slotCount;
let slotsRendered = 0;
let containers;
let onAdsCompleteCallback;
const customTimings = {};


function getContextualTargetingPromise (appName) {
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

	return (uuid && url) ? fetch(url, {
		timeout: 2000,
		useCorsProxy: true
	})
	.then(res => res.json())
	.catch(() => ({})) : Promise.resolve({});
};

function getUserTargetingPromise () {
	const apiUrlRoot = 'https://ads-api.ft.com/v1/';
	return fetch(`${apiUrlRoot}user`, {
		credentials: 'include',
		timeout: 2000,
		useCorsProxy: true
	})
		.then(res => res.json())
		.catch(() => ({}));
};

function initOAds (flags, contextData, userData) {
	const initObj = oAdsConfig(flags, contextData, userData);

	utils.log('dfp_targeting', initObj.dfp_targeting);
	onAdsCompleteCallback = onAdsComplete.bind(this, flags);

	document.addEventListener('oAds.complete', onAdsCompleteCallback);

	slotCount = containers.length;

	utils.log.info(slotCount + ' ad slots found on page');

	const ads = Ads.init(initObj);
	containers.forEach(ads.slots.initSlot.bind(ads.slots));

}

function onAdsComplete (flags, event) {
	const detail = event.detail;
	/* istanbul ignore else  */
	if (detail.type !== 'oop') {
		/* istanbul ignore else  */

		if(flags && flags.get('brokenAdReporter') && detail.slot && detail.slot.container) {
			if(detail.slot.reporter) {
				detail.slot.reporter.destroy();
			}
			detail.slot.reporter = new Reporter(detail.slot);
		}

		if (detail.slot.gpt && detail.slot.gpt.isEmpty === false) {
			utils.log.info('Ad loaded in slot', event);
			if (slotsRendered === 0) {
				perfMark('firstAdLoaded');
				if (/spoor-id=3/.test(document.cookie)) {
					customTimings.firstAdLoaded = new Date().getTime();
					const sendTimings = () => {
						customTimings.adIframeLoaded = new Date().getTime();
						perfMark('adIframeLoaded');
						sendMetrics(customTimings, detail.slot);
						document.body.removeEventListener('oAds.adIframeLoaded', sendTimings);
					}
					document.body.addEventListener('oAds.adIframeLoaded', sendTimings);
				}
			}
		} else if (detail.slot.gpt && detail.slot.gpt.isEmpty === true) {
			utils.log.warn('Failed to load ad, details below');
			utils.log(event);
		}
		slotsRendered++;
	}

	/* istanbul ignore else  */
	if (slotsRendered === slotCount) {
		utils.log('Ads component finished');
	}
}

module.exports = {
	init: flags => {
		return Promise.resolve()
			.then(() => {
				if (flags && flags.get('ads')) {
					if (/(BlackBerry|BBOS|PlayBook|BB10)/.test(navigator.userAgent)) {
						return;
					}

					if(flags && flags.get('stickyHeaderAd')) {
						let stickyAd = new Sticky(document.querySelector('.above-header-advert'), document.querySelector('.header-ad-placeholder__top'), document.querySelector('#primary-nav .o-header__top'));
						stickyAd.init();
					}

					return Promise.resolve()
						.then(() => {
							slotsRendered = 0; // Note - this is a global var fro this module
							// TODO get appName from appInfo
							const appName = utils.getAppName();
							if (flags && flags.get('ads') && appName) {
								let targetingPromises = [
									getContextualTargetingPromise(appName),
									flags.get('adTargetingUserApi') ? getUserTargetingPromise() : Promise.resolve({})
								];
								containers = [].slice.call(document.querySelectorAll('.o-ads'));
								return Promise.all(targetingPromises)
									.then(data => initOAds(flags, data[0], data[1]));
							}
						})
						.then(() => {
							if(flags && flags.get('krux')) {
								//Though krux is activated through nextAdsComponent, we also need to load all the additional user matching scripts
								//that would have been loaded via their tag manager
								krux.init(flags);
							}
						});
				}

		})
	}
}
