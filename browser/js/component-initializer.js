import Loader from './loader';
import ads from '../../components/n-ui/ads';
import tracking from '../../components/n-ui/tracking';
import date from 'o-date';
import header from '../../components/n-ui/header';
import oCookieMessage from 'o-cookie-message';
import footer from '../../components/n-ui/footer';
import offlineToast from '../../components/n-ui/offline-toast';
import { lazyLoad as lazyLoadImages } from 'n-image';
import * as serviceWorker from 'n-service-worker';
import * as syndication from 'n-syndication';

export const presets = {
	discrete: {
		header: true,
		footer: true,
		date: true
	},
	complete: {
		header: true,
		footer: true,
		date: true,
		cookieMessage: true,
		ads: true,
		tooltip: true,
		syndication: true
	}
};

function extend (o1, o2) {
	for (let key in o2) { //eslint-disable-line
		o1[key] = o2[key];
	}
	return o1;
}

export class ComponentInitializer {
	constructor () {
		this.initializedFeatures = {};
		this.configuration = {};
		this.loader = new Loader();
		this.bootstrap = this.bootstrap.bind(this);
	}

	isInitialized (feature) {
		return !!this.initializedFeatures[feature];
	}

	bootstrap (config, cb) {

		// VERY IMPORTANT NOTE
		// Everything between here and the call to this.loader.bootstrap() below
		// may run before the polyfill service has responded... so ES3 only please!!

		// backwards compatible with previous signature of bootstrap(cb);
		if (!cb && typeof config === 'function') {
			cb = config;
			config = null;
		}

		cb = cb || (() => null);
		config = config || {};

		// belt and braces backwards compatibility for old api, which expected a flat config object
		if (!config.features) {
			config.features = extend({}, config);
		}

		config.features = extend(extend({}, presets[config.preset]), config.features);

		return this.loader.bootstrap(config, ({ flags, allStylesLoaded, appInfo }) => { // eslint-disable-line

			if (!this.initializedFeatures.tracking) {
				// FT and next tracking
				tracking.init(flags, appInfo);
				this.initializedFeatures.tracking = true;
			}

			if (navigator.serviceWorker && flags.get('offlineToastMessage')) {
				offlineToast.init();
			}

			if (flags.get('serviceWorker')) {
				serviceWorker
					.register(flags)
					.catch(() => { });

				serviceWorker.message({ type: 'updateCache', data: {}});
			} else {
				serviceWorker.unregister();
			}

			if (config.features.header && !this.initializedFeatures.header) {
				header.init(flags);
				this.initializedFeatures.header = true;
			}

			if (config.features.date && !this.initializedFeatures.date) {
				date.init();
				this.initializedFeatures.date = true
			}

			if (flags.get('adInitEarlierNui')){
				if (config.features.ads && !this.initializedFeatures.ads) {
					ads.init(flags, appInfo, config.features.ads);
					this.initializedFeatures.ads = true
				}
			}

			if (config.features.lazyLoadImages && !this.initializedFeatures.lazyLoadImages) {
				lazyLoadImages();
				this.initializedFeatures.lazyLoadImages = true
			}


			allStylesLoaded
				.then(() => {

					if (config.features.footer && !this.initializedFeatures.footer) {
						footer.init(flags);
						this.initializedFeatures.footer = true;
					}

					if (flags.get('cookieMessage') && config.features.cookieMessage && !this.initializedFeatures.cookieMessage) {
						oCookieMessage.init();
						this.initializedFeatures.cookieMessage = true;
					}

					if (config.features.syndication && !this.initializedFeatures.syndication){
						syndication.init(flags);
						this.initializedFeatures.syndication = true;
					}
				});

			return Promise.resolve({flags, allStylesLoaded, appInfo})
				.then(cb)
				.then(() => {
					// TODO - lazy load this
					if (!flags.get('adInitEarlierNui')){
						if (config.features.ads && !this.initializedFeatures.ads) {
							ads.init(flags, appInfo, config.features.ads);
							this.initializedFeatures.ads = true
						}
					}

					if (!this.initializedFeatures.lazyTracking) {
						tracking.lazyInit(flags);
						this.initializedFeatures.lazyTracking = true;
					}
					return {flags, allStylesLoaded, appInfo}
				})
		})
	}
}
