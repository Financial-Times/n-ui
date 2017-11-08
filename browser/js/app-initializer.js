import ads from '../../components/n-ui/ads';
import tracking from '../../components/n-ui/tracking';
import date from 'o-date';
import header from '../../components/n-ui/header';
import roe from '../../components/n-ui/roe';
import oCookieMessage from 'o-cookie-message';
import footer from 'o-footer';
import { lazyLoad as lazyLoadImages } from 'n-image';
import * as serviceWorker from 'n-service-worker';
import DesktopAppBanner from 'n-desktop-app-banner';
import * as syndication from 'n-syndication';
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
		syndication: true,
		roe: true
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

		if (flags.get('serviceWorker')) {
			serviceWorker
				.register(flags)
				.catch(() => { });

			serviceWorker.message({ type: 'updateCache', data: {}});
		} else {
			serviceWorker.unregister();
		}

		if (this.enabledFeatures.header) {
			header.init(flags);
		}

		if (this.enabledFeatures.date) {
			date.init();
		}

		if (this.enabledFeatures.ads) {
			ads.init(flags, appInfo, this.enabledFeatures.ads);
		}

		if (this.enabledFeatures.lazyLoadImages) {
			lazyLoadImages();
		}

		// TODO - shouldn't it be possible to turn this off via the usual API?
		if (flags.get('subscriberCohort') && flags.get('onboardingMessaging') === 'appPromotingBanner') {
			new DesktopAppBanner();
		}

		allStylesLoaded
			.then(() => {

				if (this.enabledFeatures.footer) {
					footer.init();
				}

				if (this.enabledFeatures.cookieMessage && flags.get('cookieMessage')) {
					oCookieMessage.init();
				}

				if (this.enabledFeatures.syndication) {
					syndication.init(flags);
				}

				if (this.enabledFeatures.roe) {
					roe.init(flags);
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
