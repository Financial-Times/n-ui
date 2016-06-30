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

const initializedComponents = {};

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

		if (!initializedComponents.tracking) {
				// FT and next tracking
			tracking.init(flags, appInfo);
			// TODO - move n-instrumentation in to n-ui
			if (flags.get('nInstrumentation')) {
				nInstrumentation.init();
			}
			initializedComponents.tracking = true;
		}


		const opts = Object.assign({}, presets[configuration.preset], configuration);

		if (opts.myft && !initializedComponents.myftclient) {
			const clientOpts = [];

			if (flags.get('follow')) {
				clientOpts.push({relationship: 'followed', type: 'concept'});
			}

			if (flags.get('saveForLater')) {
				clientOpts.push({relationship: 'saved', type: 'content'});
			}
			myft.client.init(clientOpts);

			initializedComponents.myftClient = true
		}

		if (opts.header && !initializedComponents.header) {
			header.init(flags);
			initializedComponents.header = true;
		}
		if(opts.footer && !initializedComponents.footer){
			footer.init(flags);
			initializedComponents.footer = true
		}
		if (opts.date && !initializedComponents.date) {
			date.init();
			initializedComponents.date = true
		}

		mainCss
			.then(() => {
				if (opts.cookieMessage && !initializedComponents.cookieMessage) {
					cookieMessage.init();
					initializedComponents.cookieMessage = true;
				}

				if (opts.welcomeMessage && !initializedComponents.welcomeMessage) {
					let version = flags.get('newFooter') ? 'new' : 'old';
					flags.get('welcomePanel') && welcomeMessage[version].init({
						enableOverlay: flags.get('myFTOnboardingOverlay')
					});
					initializedComponents.welcomeMessage = true
				}

				if (opts.messagePrompts && !initializedComponents.messagePrompts) {
					messagePrompts.init();
					initializedComponents.messagePrompts = true;
				}

				if (opts.myft && !initializedComponents.myftUi) {
					myft.ui.init({
						anonymous: !(/FTSession=/.test(document.cookie)),
						flags
					});
					initializedComponents.myftUi = true;
				}

				if (opts.promoMessages && !initializedComponents.promoMessages) {
					promoMessages.init(flags);
					initializedComponents.promoMessages = true;
				}
			});

		return Promise.resolve({flags, mainCss, appInfo})
			.then(cb)
			.then(() => {
				// TODO - lazy load this
				if (!initializedComponents.ads) {
					ads.init(flags, appInfo);
					initializedComponents.ads = true
				}

				if (!initializedComponents.lazyTracking) {
					tracking.lazyInit(flags);
					initializedComponents.lazyTracking = true;
				}
				return {flags, mainCss, appInfo}
			})
	})
}

// Expose entry points to shared bundle
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
import ftdomdelegate from 'ftdomdelegate';
export const _ftdomdelegate = ftdomdelegate;
import superstore from 'superstore';
export const _superstore = superstore;
import superstoreSync from 'superstore-sync';
export const _superstoreSync = superstoreSync;
import React from 'React';
export const _React = React;
import ReactDom from 'ReactDom';
export const _ReactDom = ReactDom;
import notification from './notification';
export const _notification = notification;
import expander from './expander';
export const _expander = expander;
import grid from './grid';
export const _grid = grid;
import overlay = './overlay';
export const _overlay = overlay;
import viewport from './viewport';
export const _viewport = viewport;
