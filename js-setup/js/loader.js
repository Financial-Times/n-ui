// for safety polyfill window.console
if (!window.console) {
	window.console = {};
	const methods = ['info', 'log', 'warn', 'error'];
	for (let i = 0; i < methods.length; i++) {
		window.console[methods[i]] = function () {};
	}
}

import {load as loadFonts} from 'n-ui-foundations/typography/font-loader';
import {loadScript, waitForCondition} from './utils';
import {perfMark} from 'n-ui-foundations';
import instrumentFetch from './instrument-fetch';
const oErrors = require('o-errors');

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

class JsSetup {

	init () {

		loadFonts(document.documentElement)

		this.appInfo = {
			isProduction: document.documentElement.hasAttribute('data-next-is-production'),
			version: document.documentElement.getAttribute('data-next-version'),
			name: document.documentElement.getAttribute('data-next-app')
		};

		const flags = window.nextFeatureFlags.reduce((obj, flag) => {
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
		const swVersionEl = document.querySelector('meta[description="service-worker-version"]');
		this.appInfo.swVersion = swVersionEl ? swVersionEl.content : 'none';
		oErrors.init({
			enabled: flags.get('clientErrorReporting') && this.appInfo.isProduction,
			sentryEndpoint: 'https://edb56e86be2446eda092e69732d8654b@sentry.io/32594',
			siteVersion: this.appInfo.version,
			logLevel: flags.get('clientDetailedErrorReporting') ? 'contextonly' : 'off',
			tags: {
				appName: this.appInfo.name,
				swVersion: this.appInfo.swVersion
			},
			errorBuffer: window.errorBuffer || []
		});

		instrumentFetch(flags, oErrors);

		if (flags.get('clientAjaxErrorReporting')) {

			const realFetch = window.fetch;

			window.fetch = function (url, opts) {
				return realFetch.call(this, url, opts)
					.catch(function (err) {
						oErrors.log(url + (opts ? JSON.stringify(opts) : '' ) + err);
						throw err;
					});
			};
		}
		return Promise.resolve({
			flags: flags,
			appInfo: this.appInfo,
			mainCss: new Promise(res => {
				// if this element exists it means the page is setup to deliver critical/main css
				if (document.querySelector('style.n-layout-head-css')) {
					waitForCondition('MainCss', res);
				} else {
					res();
				}
			})
		});
	}

	bootstrap (opts, callback) {
		opts = opts || {};
		waitForCondition('Polyfill', () => {
			this.initResult = this.initResult || this.init();

			this.bootstrapResult = this.initResult
				.then(result => {
					let promise = callback(result);
					if (!(promise && typeof promise.then === 'function')) {
						promise = Promise.resolve();
					}
					return promise
						.then(() => {
							if (opts.preload) {
								perfMark('nUiJsExecuted');
							} else {
								document.documentElement.classList.add('js-success');
								perfMark('appJsExecuted');
								dispatchLoadedEvent();
							}
						});
				})
				.catch(err => {
					if (!this.appInfo.isProduction){
						if (typeof err === 'object' && err.stack) {
							console.error(err.stack); //eslint-disable-line
						} else {
							console.error(err); //eslint-disable-line
						}
					}
					oErrors.error(err);
				});
		});
	}

	loadScript (src) {
		return loadScript(src);
	}
}

module.exports = JsSetup;
