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

function initOAds (flags) {
	const initObj = oAdsConfig(flags);
	const containers = [].slice.call(document.querySelectorAll('.o-ads'));

	utils.log('dfp_targeting', initObj.dfp_targeting);
	onAdsCompleteCallback = onAdsComplete.bind(this, flags);

	document.addEventListener('oAds.complete', onAdsCompleteCallback);

	slotCount = containers.length;

	utils.log.info(slotCount + ' ad slots found on page');
	const ads = Ads.init(initObj)
	ads.then(res => containers.forEach(res.slots.initSlot.bind(res.slots)));
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
<<<<<<< HEAD
				if(flags && flags.get('stickyHeaderAd')) {
					let stickyAd = new Sticky(
						document.querySelector('.above-header-advert'),
						{ 'sibling' : '.header-ad-placeholder__top',
						'stickUntil' : '#primary-nav .o-header__top'
						});
					stickyAd.init();
				}
				if(flags && flags.get('stickyRightAd')) {
					let stickyRight = new Sticky(
						document.querySelector('.sidebar-advert'),
						{	'topOffset' : '70px',
							'stickUntil' : 'footer'
						});
					stickyRight.init();
				}
=======

					if(flags && flags.get('stickyHeaderAd')) {
						let stickyAd = new Sticky(document.querySelector('.above-header-advert'), document.querySelector('.header-ad-placeholder__top'), document.querySelector('#primary-nav .o-header__top'));
						stickyAd.init();
					}

>>>>>>> master
					return Promise.resolve()
						.then(() => {
							// slotsRendered = 0; // Note - this is a global var for this module
							// TODO get appName from appInfo
							const appName = utils.getAppName();
							if (flags && flags.get('ads') && appName) {
								initOAds(flags);
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
