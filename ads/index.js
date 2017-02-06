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
let onAdsCompleteCallback;
const customTimings = {};

function initOAds (flags, appName, adOptions) {
	const initObj = oAdsConfig(flags, appName, adOptions);
	console.log(initObj);
	let regexPageType = /(pt=)([^;]*)/;
	let regexMVT = /(mvt=)([^;]*)/;
	let res = Ads.utils.responsive.getCurrent();
	console.log(res);
	let metrics = '';
	metrics += 'adUnit=' + initObj.gpt.site + '/' + initObj.gpt.zone;
	utils.log('dfp_targeting', initObj.dfp_targeting);
	onAdsCompleteCallback = onAdsComplete.bind(this, flags);

	document.addEventListener('oAds.complete', onAdsCompleteCallback);

	let consolidateMetrics = function(container, metrics){
		let slotName = container.dataset['oAdsName'];
		metrics += "|slotName=" + slotName;
		if (container.dataset['oAdsTargeting']!=="") container.dataset['oAdsTargeting'] +=';';
		container.dataset['oAdsTargeting'] += "metrics=" + metrics;
	}

	const ads = Ads.init(initObj)
	ads.then(res => {
		const containers = [].slice.call(document.querySelectorAll('.o-ads'));
		console.log(res.targeting.get());
		metrics += (res.targeting.get().pt) ? '|pageType=' + res.targeting.get().pt : '';
		metrics += (res.targeting.get().res) ? '|res=' + res.targeting.get().res : '';
		containers.forEach(function (element) {
        consolidateMetrics(element, metrics);
			});
		slotCount = containers.length;
		utils.log.info(slotCount + ' ad slots found on page');
		containers.forEach(res.slots.initSlot.bind(res.slots))
	});
}

function initStickyHeaderAdvert (flags) {
	if(flags && flags.get('stickyHeaderAd')) {
		const stickyAd = new Sticky(
			document.querySelector('[data-sticky-ad]'),
			document.querySelector('.n-layout'),
			document.querySelector('.o-header__row.o-header__top')
		);
		stickyAd.init();
	}
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

					customTimings.firstAdLoaded = new Date().getTime();
					const iframeLoadedCallback = () => {
						initStickyHeaderAdvert(flags);
						if (/spoor-id=3/.test(document.cookie)) {
							customTimings.adIframeLoaded = new Date().getTime();
							perfMark('adIframeLoaded');
							sendMetrics(customTimings, detail.slot);
						}
						document.body.removeEventListener('oAds.adIframeLoaded', iframeLoadedCallback);
					}
					document.body.addEventListener('oAds.adIframeLoaded', iframeLoadedCallback);
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
	init: (flags, appInfo, opts) => {

		const adOptions = typeof opts === 'object' ? opts : {};

		return Promise.resolve()
			.then(() => {
				if (flags && flags.get('ads')) {
					if (/(BlackBerry|BBOS|PlayBook|BB10)/.test(navigator.userAgent)) {
						return;
					}

					return Promise.resolve()
						.then(() => {
							// slotsRendered = 0; // Note - this is a global var for this module
							// TODO get appName from appInfo
							const appName = appInfo.name;
							if (flags && flags.get('ads') && appName) {
								initOAds(flags, appName, adOptions);
							}
						})
						.then(() => {
							if(flags && flags.get('krux') && !adOptions.noTargeting) {
								//Though krux is activated through nextAdsComponent, we also need to load all the additional user matching scripts
								//that would have been loaded via their tag manager
								krux.init(flags);
							}
						});
				}

		})
	}
}
