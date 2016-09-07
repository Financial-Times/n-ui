import Loader from './loader';
import ads from '../../ads';
import tracking from '../../tracking';
import date from '../../date';
import header from '../../header';
import optOut from '../../opt-out';
import promoMessages from '../../promo-messages';
import cookieMessage from '../../cookie-message';
import welcomeMessage from '../../welcome-message';
import messagePrompts from '../../message-prompts';
import footer from '../../footer';
import myft from '../../myft';
import { lazyLoad as lazyLoadImages } from 'n-image';
import * as serviceWorker from 'n-service-worker';

export const presets = {
	discrete: {
		header: true,
		footer: true,
		date: true,
		welcomeMessage: true
	},
	complete: {
		header: true,
		footer: true,
		date: true,
		cookieMessage: true,
		welcomeMessage: true,
		myft: true,
		messagePrompts: false,
		promoMessages: false,
		ads: true
	}
};

export class ComponentInitializer {
	constructor () {
		this.initializedFeatures = {};
		this.configuration = {};
		this.loader = new Loader();
		this.configure = this.configure.bind(this);
		this.bootstrap = this.bootstrap.bind(this);
	}

	isInitialized (feature) {
		return !!this.initializedFeatures[feature];
	}

	configure (options = {}) {
		// NOTE: just store configuration for now, need to wait for polyfill to load before assigning
		console.log('n-ui.configure is deprecated - pass in your config object as a first argument to bootstrap instead')
		this.configuration = options;
	}

	bootstrap (config, cb) {
		// backwards compatible with previous signature of bootstrap(cb);
		if (!cb && typeof config === 'function') {
			cb = config;
			config = null;
		}

		cb = cb || (() => null);
		config = config || this.configuration || {};

		// belt and braces backwards compatibility for old api, which expected a flat config object
		if (!config.features) {
			config.features = Object.assign({}, config);
		}

		config.features = Object.assign({}, presets[config.preset], config.features);

		return this.loader.bootstrap(config, ({ flags, mainCss, appInfo }) => { // eslint-disable-line

			if (!this.initializedFeatures.tracking) {
				// FT and next tracking
				tracking.init(flags, appInfo);
				this.initializedFeatures.tracking = true;
			}

			if (flags.get('serviceWorker')) {
				serviceWorker
					.register(flags)
					.catch(() => { });
			} else {
				serviceWorker.unregister();
			}

			if (flags.get('optInOut')) {
				optOut.init();
			}

			if (config.features.myft && !this.initializedFeatures.myftclient) {
				const clientOpts = [];

				if (flags.get('follow')) {
					clientOpts.push({relationship: 'followed', type: 'concept'});
				}

				if (flags.get('saveForLater')) {
					clientOpts.push({relationship: 'saved', type: 'content'});
				}
				myft.client.init(clientOpts);

				this.initializedFeatures.myftClient = true
			}

			if (config.features.header && !this.initializedFeatures.header) {
				header.init(flags);
				this.initializedFeatures.header = true;
			}

			if (config.features.date && !this.initializedFeatures.date) {
				date.init();
				this.initializedFeatures.date = true
			}

			if (config.features.lazyLoadImages && !this.initializedFeatures.lazyLoadImages) {
				lazyLoadImages();
				this.initializedFeatures.lazyLoadImages = true
			}

			mainCss
				.then(() => {

					if (config.features.footer && !this.initializedFeatures.footer) {
						footer.init(flags);
						this.initializedFeatures.footer = true
					}

					if (config.features.cookieMessage && !this.initializedFeatures.cookieMessage) {
						cookieMessage.init(flags);
						this.initializedFeatures.cookieMessage = true;
					}

					if (config.features.welcomeMessage && !this.initializedFeatures.welcomeMessage) {
						flags.get('welcomePanel') && welcomeMessage.init();
						this.initializedFeatures.welcomeMessage = true
					}

					if (config.features.messagePrompts && !this.initializedFeatures.messagePrompts) {
						messagePrompts.init(flags);
						this.initializedFeatures.messagePrompts = true;
					}

					if (config.features.myft && !this.initializedFeatures.myftUi) {
						myft.ui.init({
							anonymous: !(/FTSession=/.test(document.cookie)),
							flags
						});
						myft.uiInstant.init({
							anonymous: !(/FTSession=/.test(document.cookie)),
							flags
						});
						this.initializedFeatures.myftUi = true;
					}

					if (config.features.promoMessages && !this.initializedFeatures.promoMessages) {
						promoMessages.init(flags);
						this.initializedFeatures.promoMessages = true;
					}
				});

			return Promise.resolve({flags, mainCss, appInfo})
				.then(cb)
				.then(() => {
					// TODO - lazy load this
					if (!this.initializedFeatures.ads) {
						ads.init(flags, appInfo);
						this.initializedFeatures.ads = true
					}

					if (!this.initializedFeatures.lazyTracking) {
						tracking.lazyInit(flags);
						this.initializedFeatures.lazyTracking = true;
					}
					return {flags, mainCss, appInfo}
				})
		})
	}
}
