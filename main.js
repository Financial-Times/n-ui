// to avoid race conditions relating to Symbol polyfills
import 'babel-polyfill-silencer';

import layout from './layout';
import ads from './ads';
import tracking from './tracking';
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

let initializedFeatures = {};

export function isInitialized (feature) {
	return !!initializedFeatures[feature];
}

export function reset () {
	initializedFeatures = {};
}

let configuration = {};

export function configure (options = {}) {
	// NOTE: just store configuration for now, need to wait for polyfill to load before assigning
	console.log('n-ui.configure is deprecated - pass in your config object as a first argument to bootstrap instead')
	configuration = options;
}

export function bootstrap (config, cb) {
	// backwards compatible with previous signature of bootstrap(cb);
	if (!cb && typeof config === 'function') {
		cb = config;
		config = null;
	}

	cb = cb || (() => null);
	config = config || configuration;

	// belt and braces backwards compatibility for old api, which expected a flat config object
	if (!config.features) {
		config.features = Object.assign({}, config);
	}

	config.features = Object.assign({}, presets[config.preset], config.features);

	return layout.bootstrap(config, ({ flags, mainCss, appInfo }) => { // eslint-disable-line

		if (!isInitialized('tracking')) {
			// FT and next tracking
			tracking.init(flags, appInfo);
			initializedFeatures.tracking = true;
		}

		if (config.features.myft && !isInitialized('myftclient')) {
			const clientOpts = [];

			if (flags.get('follow')) {
				clientOpts.push({relationship: 'followed', type: 'concept'});
			}

			if (flags.get('saveForLater')) {
				clientOpts.push({relationship: 'saved', type: 'content'});
			}
			myft.client.init(clientOpts);

			initializedFeatures.myftClient = true
		}

		if (config.features.header && !isInitialized('header')) {
			header.init(flags);
			initializedFeatures.header = true;
		}

		if (config.features.footer && !isInitialized('footer')) {
			footer.init(flags);
			initializedFeatures.footer = true
		}

		if (config.features.date && !isInitialized('date')) {
			date.init();
			initializedFeatures.date = true
		}

		mainCss
			.then(() => {
				if (config.features.cookieMessage && !isInitialized('cookieMessage')) {
					cookieMessage.init();
					initializedFeatures.cookieMessage = true;
				}

				if (config.features.welcomeMessage && !isInitialized('welcomeMessage')) {
					flags.get('welcomePanel') && welcomeMessage.init();
					initializedFeatures.welcomeMessage = true
				}

				if (config.features.messagePrompts && !isInitialized('messagePrompts')) {
					messagePrompts.init();
					initializedFeatures.messagePrompts = true;
				}

				if (config.features.myft && !isInitialized('myftUi')) {
					myft.ui.init({
						anonymous: !(/FTSession=/.test(document.cookie)),
						flags
					});
					initializedFeatures.myftUi = true;
				}

				if (config.features.promoMessages && !isInitialized('promoMessages')) {
					promoMessages.init(flags);
					initializedFeatures.promoMessages = true;
				}
			});

		return Promise.resolve({flags, mainCss, appInfo})
			.then(cb)
			.then(() => {
				// TODO - lazy load this
				if (!isInitialized('ads')) {
					ads.init(flags, appInfo);
					initializedFeatures.ads = true
				}

				if (!isInitialized('lazyTracking')) {
					tracking.lazyInit(flags);
					initializedFeatures.lazyTracking = true;
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
import React from 'react';
export const _React = React;
import ReactDom from 'react-dom';
export const _ReactDom = ReactDom;
import notification from './notification';
export const _notification = notification;
import expander from './expander';
export const _expander = expander;
import grid from './grid';
export const _grid = grid;
import overlay from './overlay';
export const _overlay = overlay;
import viewport from './viewport';
export const _viewport = viewport;
