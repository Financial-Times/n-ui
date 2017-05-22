const krux = require('./js/krux');
const Ads = window.oAds = require('o-ads');
// TODO move to central shared utils
const utils = require('./js/utils');
const oAdsConfig = require('./js/oAdsConfig');
const Reporter = require('./js/reporter');
const sendMetrics = require('./js/metrics');
const Sticky = require('./js/sticky');

import nCounterAdBlocking from 'n-counter-ad-blocking';
import { perfMark } from 'n-ui-foundations';

let slotCount;
let slotsRendered = 0;
let onAdsCompleteCallback;
const customTimings = {};
let oadsReadyCalled = false;

function initOAds (flags, appName, adOptions) {
	const initObj = oAdsConfig(flags, appName, adOptions);

	utils.log('dfp_targeting', initObj.dfp_targeting);
	onAdsCompleteCallback = onAdsComplete.bind(this, flags);

	document.addEventListener('oAds.ready', function (){
		if (!oadsReadyCalled) {
			customTimings.firstAdRequested = new Date().getTime();
			oadsReadyCalled = true;
		}
	});
	document.addEventListener('oAds.complete', onAdsCompleteCallback);


	const ads = Ads.init(initObj)
	ads.then(res => {
		const containers = [].slice.call(document.querySelectorAll('.o-ads'));
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

		window.addEventListener('ftNextLoaded', function () {
			nCounterAdBlocking.init(flags);
		});

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
