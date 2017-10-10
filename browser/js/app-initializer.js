import Loader from './loader';
import ads from '../../components/n-ui/ads';
import tracking from '../../components/n-ui/tracking';
import date from 'o-date';
import header from '../../components/n-ui/header';
import oCookieMessage from 'o-cookie-message';
import footer from '../../components/n-ui/footer';
import { lazyLoad as lazyLoadImages } from 'n-image';
import * as serviceWorker from 'n-service-worker';
import DesktopAppBanner from 'n-desktop-app-banner';
import * as syndication from 'n-syndication';
import { perfMark, broadcast } from 'n-ui-foundations';
import { waitForCondition } from './utils';

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

// Dispatch a custom `ftNextLoaded` event after the app executes.
function dispatchLoadedEvent () {
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
}

export class AppInitializer {

	initEnv () {

		this.appInfo = {
			isProduction: document.documentElement.hasAttribute('data-next-is-production'),
			version: document.documentElement.getAttribute('data-next-version'),
			name: document.documentElement.getAttribute('data-next-app'),
			product: document.documentElement.getAttribute('data-next-product')
		};

		const flags = window.FT.flags.reduce((obj, flag) => {
			obj[flag.name] = flag.state;
			return obj;
		}, {
			get: function (name) {
				return this[name];
			},
			getAll: function () {
				return this;
			}
		});

		return {
			flags: flags,
			appInfo: this.appInfo,
			allStylesLoaded: new Promise(res => {
				// if this element exists it means the page is setup to deliver critical/main css
				if (document.querySelector('style.n-layout-head-css')) {
					waitForCondition('AllStyles', res);
				} else {
					res();
				}
			}
		});
	}

	bootstrap (config) {
		this.config = config || {};

		this.config.features = Object.assign({}, presets[this.config.preset], this.config.features);

		try {
			const initResult = this.initEnv();
			this.initializeComponents(initResult);
			return initResult;
		} catch (err) {
			if (!this.appInfo.isProduction){
				if (typeof err === 'object' && err.stack) {
					console.error(err.stack); //eslint-disable-line
				} else {
					console.error(err); //eslint-disable-line
				}
			}

			broadcast('oErrors.log', {
				error: err,
				info: {
					lifecycle: 'app initialisation'
				}
			});
		}
	}

	initializeComponents ({ flags, allStylesLoaded, appInfo }) { // eslint-disable-line

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

		if (this.config.features.header) {
			header.init(flags);
		}

		if (this.config.features.date) {
			date.init();
		}

		if (this.config.features.ads) {
			ads.init(flags, appInfo, this.config.features.ads);
		}

		if (this.config.features.lazyLoadImages) {
			lazyLoadImages();
		}

		if (flags.get('subscriberCohort') && flags.get('onboardingMessaging') === 'appPromotingBanner') {
			new DesktopAppBanner();
		}

		allStylesLoaded
			.then(() => {

				if (this.config.features.footer) {
					footer.init(flags);
				}

				if (flags.get('cookieMessage') && this.config.features.cookieMessage) {
					oCookieMessage.init();
				}

				if (this.config.features.syndication) {
					syndication.init(flags);
				}
			});
		perfMark('nUiJsExecuted');
	}

	onAppInitialiased: () => {
		perfMark('appJsExecuted');
		dispatchLoadedEvent();
		tracking.lazyInit(flags);
		document.documentElement.classList.add('js-success');
	}
}
