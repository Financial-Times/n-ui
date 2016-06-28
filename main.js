
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
import footer from './footer';
import myft from './myft';
import { perfMark } from './utils';


export const _ads = ads;
export const _tracking = tracking;
export const _date = date;
export const _header = header;
export const _promoMessages = promoMessages;
export const _cookieMessage = cookieMessage;
export const _welcomeMessage = welcomeMessage;
export const _messagePrompts = messagePrompts;
export const _myft = myft;
import utils from './utils';
export const _utils = utils;

const presets = {
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
		welcomeMessage: true,
		myft: true,
		messagePrompts: true,
		promoMessages: false,
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
			myft.client.init(clientOpts);
		}

		if (opts.header) {
			header.init(flags);
		}

		if(opts.footer){
			footer.init(flags)
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
					let version = flags.get('newFooter') ? 'new' : 'old';
					flags.get('welcomePanel') && welcomeMessage[version].init({
						enableOverlay: flags.get('myFTOnboardingOverlay')
					});
				}

				if (opts.messagePrompts) {
					messagePrompts.init();
				}

				if (opts.myft) {
					myft.ui.init({
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
