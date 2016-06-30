const krux = require('./js/krux');
const Ads = window.oAds = require('o-ads');
// TODO move to central shared utils
const utils = require('./js/utils');
const oAdsConfig = require('./js/oAdsConfig');
const jsonpFetch = require('n-jsonp');
const Reporter = require('./js/reporter');

import { perfMark } from '../utils'
import { broadcast } from '../utils'

let slotCount;
let slotsRendered = 0;
let containers;
let onAdsCompleteCallback;

function getContextualTargetingPromise (appName) {
	let promise = Promise.resolve({});
	let uuid;
	let url;

	if(appName === 'article') {
		uuid = document.querySelector('[data-content-id]').getAttribute('data-content-id');

		const referrer = utils.getReferrer();
		url = `https://ads-api.ft.com/v1/content/${uuid}`;
		if(referrer) {
			url += `?referrer=${encodeURIComponent(referrer.split(/[?#]/)[0])}`;
		}
	} else if (appName === 'stream-page') {
		uuid = document.querySelector('[data-concept-id]').getAttribute('data-concept-id');
		url = `https://ads-api.ft.com/v1/concept/${uuid}`;
	}

	if(uuid && url) {
		promise = jsonpFetch.default(url, { timeout: 2000 })
			.then(res => res.json())
			.catch(() => ({}));
	}

	return promise;
};

function getUserTargetingPromise () {
	const apiUrl = ('withCredentials' in new XMLHttpRequest()) ? 'https://ads-api.ft.com/v1/user' : '/__ads-api/v1/user';
	return fetch(apiUrl, {
		credentials: 'include',
		timeout: 2000
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

		if(flags && flags.get('brokenAdReporter')) {
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
					sendAdLoadedTrackingEvent();
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


function sendAdLoadedTrackingEvent () {
	const performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
	if (performance && performance.mark) {
		const currentTime = new Date().getTime();
		const offsets = {
			domContentLoadedEventEnd: {
				firstAdLoaded: currentTime - performance.timing['domContentLoadedEventEnd'],
				loadEventEnd: currentTime - performance.timing['loadEventEnd'],
				domInteractive: currentTime - performance.timing['domInteractive']
			}
		};

		const marks = performance.getEntriesByType ?
			performance.getEntriesByName('firstAdLoaded')
				.reduce((marks, mark) => {
					marks[mark.name] = Math.round(mark.startTime);
					return marks;
				}, {}) :
			{};

		broadcast('oTracking.event', {
			category: 'ads',
			action: 'first-load',
			timings: { offsets, marks }
		});
	}
}


module.exports = {
	onload: flags => {
		return Promise.resolve()
			.then(() => {
				if (flags && flags.get('ads')) {
					if (/(BlackBerry|BBOS|PlayBook|BB10)/.test(navigator.userAgent)) {
						return;
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
	},
	init: function (flags) {
		if(flags && flags.get('adsPrioritiseLoading')) {
			this.onload(flags);
		} else {
			window.addEventListener('ftNextLoaded', () => {
				this.onload(flags);
			});
		}
	}
}
