import Ads from 'o-ads';
import oPermutive from 'o-permutive';

//TODO move to central shared utils
import utils from './js/utils';
import oAdsConfig from './js/oAdsConfig';
import { getOPermutiveConfig, getOPermutiveMetaData } from './js/oPermutiveConfig';
import { setupAdsMetrics } from './js/ads-metrics';
import nCounterAdBlocking from 'n-counter-ad-blocking';

function addToTargeting (something) {
	this.instance.targeting.add({
		something,
	});
}

function addZone (content) {
	if (this.config.usePageZone && content.adUnit) {
		const gpt = this.instance.config('gpt');

		/* istanbul ignore else  */
		if (gpt && gpt.zone) {
			gpt.zone = content.adUnit.join('/');
		}
	}
}

function handleResponse ([user, content]) {
	Ads.utils.broadcast('adsAPIComplete');
	this.data = [user, content];

	if (user) {
		addToTargeting(user);
	}

	if (content) {
		this.addToTargeting(content);
		this.addZone(content);
	}

	return [user, content];
};

Ads.api.addToTargeting = addToTargeting.bind(Ads.api);
Ads.api.addZone = addZone.bind(Ads.api);
Ads.api.handleResponse = handleResponse.bind(Ads.api);

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

								const targeting = Ads.targeting.get();
								const metaData = getOPermutiveMetaData(appInfo.name, targeting, contentId);

								if (targeting.user) {
									const spId = targeting.user.spoorId;
									const gId = targeting.user.uuid;

									let userIdent = [];
									if (typeof spId !== 'undefined') { userIdent.push({ id: spId, tag: 'SporeID' }); }
									if (typeof gId !== 'undefined') { userIdent.push({ id: gId, tag: 'GUID' }); }

									if (userIdent.length > 0 && window.permutive) {
										window.permutive.identify(userIdent);
									}
								}

								console.log('META', metaData)
								oPermutive.setPageMetaData(metaData);
							}
						});
				}

			});
	}
};
