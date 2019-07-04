import krux from './js/krux';
import Ads from 'o-ads';
import oPermutive from 'o-permutive';

//TODO move to central shared utils
import utils from './js/utils';
import oAdsConfig from './js/oAdsConfig';
import { getOPermutiveConfig, getOPermutiveMetaData } from './js/oPermutiveConfig';
import { setupAdsMetrics } from './js/ads-metrics';
import nCounterAdBlocking from 'n-counter-ad-blocking';

window.oAds = Ads;

function initOAds (flags, appName, adOptions) {
	const initObj = oAdsConfig(flags, appName, adOptions);

	setupAdsMetrics(flags && flags.adsDisableMetricsSampling);

	utils.log('dfp_targeting', initObj.dfp_targeting);

	const ads = Ads.init(initObj);
	return ads.then(res => {
		const containers = [].slice.call(document.querySelectorAll('.o-ads'));
		utils.log.info(containers.length + ' ad slots found on page');

		if (!res) {
			utils.log.warn('Empty init response, likely an issue with o-ads, ads might not work properly');
			return;
		}

		containers.forEach(res.slots.initSlot.bind(res.slots));
	});
}

export default {
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
						// o-ads
						.then(() => {
							// slotsRendered = 0; // Note - this is a global var for this module
							if (flags && flags.get('ads') && appInfo.name) {
								return initOAds(flags, appInfo.name, adOptions);
							}
						})
						// o-permutive
						.then(() => {
							if (flags && flags.get('AdsPermutive')) {
								const contentId = (appInfo.name === 'article')
									? document.documentElement.getAttribute('data-content-id')
									: null;

								const oPermutiveConfig = getOPermutiveConfig();
								oPermutive.init(oPermutiveConfig);

								const metaData = getOPermutiveMetaData(appInfo.name, Ads.krux.customAttributes, contentId);
								const userIdent = {
									spoorID: Ads.targeting.get().device_spoor_id,
									guid: Ads.targeting.get().guid
								};

								oPermutive.setPageMetaData(metaData);
								oPermutive.identifyUser(userIdent);
							}
						})
						// krux
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
