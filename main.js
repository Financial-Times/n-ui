// TODO: integrate next-js-setup into this repo
import layout from './layout';
import ads from './ads';
import tracking from './tracking';
import nInstrumentation from 'n-instrumentation';
import date from './date';
import header from './header';
import promoMessages from './promo-messages';
import cookieMessage from './cookie-message';
import welcomeMessage from './welcome-message';
import messagePrompts from './message-prompts';
import { client as myFtClient, ui as myFtUi } from './myft';
import { perfMark } from './utils';

const presets = {
	discrete: {
		header: true,
		date: true
	},
	complete: {
		header: true,
		date: true,
		cookieMessage: true,
		welcomeMessage: true,
		myft: true,
		messagePrompts: true,
		promoMessages: true,
		ads: true
	}
};

let configuration = {};

export function configure (options = {}) {
	// NOTE: just store configuration for now, need to wait for polyfill to load before assigning
	configuration = options;
}

export function bootstrap (cb) {
	cb = cb || (() => null);

	return layout.bootstrap(({ flags, mainCss, appInfo }) => { // eslint-disable-line

		if (!configuration.preset) {
			throw new Error('n-ui configure options must include a preset');
		}

		// FT and next tracking
		tracking.init(flags, appInfo);
		// TODO - move n-instrumentation in to n-ui
		if (flags.get('nInstrumentation')) {
			nInstrumentation.init();
		}

		const opts = Object.assign({}, presets[configuration.preset], configuration);

		if (opts.myft) {

			const clientOpts = [];

			if (flags.get('follow')) {
				clientOpts.push({relationship: 'followed', type: 'concept'});
			}

			if (flags.get('saveForLater')) {
				clientOpts.push({relationship: 'saved', type: 'content'});
			}
			myFtClient.init(clientOpts);
		}

		if (opts.header) {
			header.init(flags);
		}

		if (opts.date) {
			date.init();
		}
		perfMark('criticalJsExecuted');
		mainCss
			.then(() => {
				if (opts.cookieMessage) {
					cookieMessage.init();
				}

				if (opts.welcomeMessage) {
					flags.get('welcomePanel') && welcomeMessage.init({
						enableOverlay: flags.get('myFTOnboardingOverlay')
					});
				}

				if (opts.messagePrompts) {
					messagePrompts.init();
				}

				if (opts.myft) {
					myFtUi.init({
						anonymous: !(/FTSession=/.test(document.cookie)),
						flags
					});
				}

				if (opts.promoMessages) {
					promoMessages.init(flags);
				}
				perfMark('lazyJsExecuted');
			});

		return Promise.resolve({flags, mainCss, appInfo})
			.then(cb)
			.then(() => {
				// TODO - lazy load this
				ads.init(flags, appInfo);
				tracking.lazyInit(flags);
			})
	})
}
