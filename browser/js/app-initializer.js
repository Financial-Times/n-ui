const lazyImports = {
	header: import(/* webpackChunkName: './public/n-ui/lazy/header' */ '../../components/n-ui/header'), // eslint-disable-line
	footer: import(/* webpackChunkName: './public/n-ui/lazy/footer' */ 'o-footer'),// eslint-disable-line
	date: import(/* webpackChunkName: './public/n-ui/lazy/date' */ 'o-date'),// eslint-disable-line
	cookieMessage: import(/* webpackChunkName: './public/n-ui/lazy/cookie-message' */ 'o-cookie-message'),// eslint-disable-line
	ads: import(/* webpackChunkName: './public/n-ui/lazy/ads' */ '../../components/n-ui/ads'),// eslint-disable-line
	syndication: import(/* webpackChunkName: './public/n-ui/lazy/syndication' */ 'n-syndication'),// eslint-disable-line
	desktopAppBanner: import(/* webpackChunkName: './public/n-ui/lazy/desktop-app-banner' */ 'n-desktop-app-banner'),// eslint-disable-line
	nImage: import(/* webpackChunkName: './public/n-ui/lazy/n-image' */ 'n-image')// eslint-disable-line
};

const lazyImport = async (componentKey) => await lazyImports[componentKey];

// import ads from '../../components/n-ui/ads';
// import tracking from '../../components/n-ui/tracking';
// import date from 'o-date';
// import header from '../../components/n-ui/header';
// import oCookieMessage from 'o-cookie-message';
// import footer from 'o-footer';
// import * as serviceWorker from 'n-service-worker';
// import DesktopAppBanner from 'n-desktop-app-banner';
// import * as syndication from 'n-syndication';


import tracking from '../../components/n-ui/tracking';
import * as serviceWorker from 'n-service-worker';
import { perfMark } from 'n-ui-foundations';

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
		syndication: true
	}
};

const waitForCondition = (conditionName, action) => {
	window.FT.conditions[conditionName] ? action() : document.addEventListener(`FT.${conditionName}`, action);
};

// Dispatch a custom `ftNextLoaded` event after the app executes.
const dispatchLoadedEvent = () => {
	let ftNextLoaded = false;
	const ftNextLoadedTrigger = () => {
		if (document.readyState === 'complete' && ftNextLoaded === false) {
			ftNextLoaded = true;
			window.dispatchEvent(new CustomEvent('ftNextLoaded'));
			return true;
		}
	};
	if (!ftNextLoadedTrigger()) {
		window.addEventListener('load', ftNextLoadedTrigger);
		document.onreadystatechange = ftNextLoadedTrigger;
	}
};

export class AppInitializer {
	constructor () {
		this.onAppInitialized = this.onAppInitialized.bind(this);

		const appInfo = {
			isProduction: document.documentElement.hasAttribute('data-next-is-production'),
			version: document.documentElement.getAttribute('data-next-version'),
			name: document.documentElement.getAttribute('data-next-app'),
			product: document.documentElement.getAttribute('data-next-product')
		};

		const flags = Object.assign(window.FT.flags, {
			get: function (name) {
				return this[name];
			},
			getAll: function () {
				return this;
			}
		});

		this.env = {
			flags,
			appInfo,
			tracking,
			onAppInitialized: this.onAppInitialized,
			allStylesLoaded: new Promise(res => {
				// if this element exists it means the page is setup to deliver critical/main css
				if (document.querySelector('style.n-layout-head-css')) {
					waitForCondition('allStylesLoaded', res);
				} else {
					res();
				}
			})
		};
	}

	bootstrap (config) {
		config = config || {};
		this.enabledFeatures = Object.assign({}, presets[config.preset], config.features);
		this.initializeComponents();
		perfMark('nUiJsExecuted');
		return this.env;
	}

	initializeComponents () {
		const { flags, allStylesLoaded, appInfo } = this.env;

		// FT and next tracking
		tracking.init(flags, appInfo);
		// this.env.tracking = tracking;

		if (flags.get('serviceWorker')) {
			serviceWorker
				.register(flags)
				.catch(() => { });

			serviceWorker.message({ type: 'updateCache', data: {} });
		} else {
			serviceWorker.unregister();
		}

		if (this.enabledFeatures.header) {
			lazyImport('header').then(header => header.init(flags));
		}

		if (this.enabledFeatures.date) {
			lazyImport('date').then(date => date.init());
		}

		if (this.enabledFeatures.ads) {
			lazyImport('ads').then(ads => {
				this.env.ads = ads;
				ads.init(flags, appInfo, true);
			});
		}

		if (this.enabledFeatures.lazyLoadImages) {
			lazyImport('nImage').then(({ lazyLoad: lazyLoadImages }) => lazyLoadImages());
		}

		// shouldn't it be possible to turn this off via the usual API?
		// No - this is controlled by the Brain (behavioural data from VoltDB)
		if (flags.get('subscriberCohort') && flags.get('onboardingMessaging') === 'appPromotingBanner') {
			lazyImport('desktopAppBanner').then(DesktopAppBanner => new DesktopAppBanner());
		}

		allStylesLoaded
			.then(() => {

				if (this.enabledFeatures.footer) {
					lazyImport('footer').then(footer => footer.init());
				}

				if (this.enabledFeatures.cookieMessage && flags.get('cookieMessage')) {
					lazyImport('cookieMessage').then(cookieMessage => cookieMessage.init());
				}

				if (this.enabledFeatures.syndication) {
					lazyImport('syndication').then(syndication => syndication.init(flags));
				}
			});
	}

	onAppInitialized () {
		perfMark('appJsExecuted');
		dispatchLoadedEvent();
		tracking.lazyInit(this.env.flags);
		document.documentElement.classList.add('js-success');
	}
}
