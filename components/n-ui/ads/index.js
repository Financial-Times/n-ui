import krux from './js/krux';
import Ads from 'o-ads';
import oPermutive from 'o-permutive';

//TODO move to central shared utils
import utils from './js/utils';
import oAdsConfig from './js/oAdsConfig';
import { setupAdsMetrics } from './js/ads-metrics';
import nCounterAdBlocking from 'n-counter-ad-blocking';

let slotCount;
let slotsRendered = 0;
let onAdsCompleteCallback;

window.oAds = Ads;

function initOAds (flags, appName, adOptions) {
	const initObj = oAdsConfig(flags, appName, adOptions);

	setupAdsMetrics();

	utils.log('dfp_targeting', initObj.dfp_targeting);
	onAdsCompleteCallback = onAdsComplete.bind(this, flags);

	document.addEventListener('oAds.slotExpand', onAdsCompleteCallback);

	const ads = Ads.init(initObj);
	ads.then(res => {
		const containers = [].slice.call(document.querySelectorAll('.o-ads'));
		slotCount = containers.length;
		utils.log.info(slotCount + ' ad slots found on page');

		if (!res) {
			utils.log.warn('Empty init response, likely an issue with o-ads, ads might not work properly');
			return;
		}

		containers.forEach(res.slots.initSlot.bind(res.slots));
	});
}

function onAdsComplete (flags, event) {
	const detail = event.detail;
	/* istanbul ignore else  */
	if (detail.type !== 'oop') {
		/* istanbul ignore else  */

		if (detail.slot.gpt && detail.slot.gpt.isEmpty === false) {
			utils.log.info('Ad loaded in slot', event);
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

export default {
	init: (flags, appInfo, opts) => {

		window.addEventListener('ftNextLoaded', function () {
			nCounterAdBlocking.init(flags);
		});

		if (flags && flags.get('AdsPermutive')) {
			let oPermConf = {
				'appInfo' : {
					'appName' : 'article',
					'contentId' : '5cfae92e-6cc5-11e9-80c7-60ee53e6681d'
				},
				'publicApiKeys' : {
					'id' : 'e1c3fd73-dd41-4abd-b80b-4278d52bf7aa',
					'key' : 'b2b3b748-e1f6-4bd5-b2f2-26debc8075a3'
				},
				'adsApi' : {
					'user' : 'https://ads-api.ft.com/v1/user',
					'content' : 'https://ads-api.ft.com/v1/content/'
				}
			};
			oPermutive.init(false, oPermConf);
		}

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
							//TODO get appName from appInfo
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

			});
	}
};
