// for safety polyfill window.console
if (!window.console) {
	window.console = {};
	const methods = ['info', 'log', 'warn', 'error'];
	for (let i = 0; i < methods.length; i++) {
		window.console[methods[i]] = function () {};
	}
}

import {load as loadFonts} from '../../typography/font-loader';
const nThirdPartyCode = require('n-third-party-code');
const oErrors = require('o-errors');

function waitForCondition (conditionName, action) {
	return window[`ftNext${conditionName}Loaded`] ?
		action() :
		document.addEventListener(`ftNext${conditionName}Loaded`, action);
}

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

	init (opts) {
		loadFonts(document.documentElement)
		const nInstrumentation = require('n-instrumentation');

		this.appInfo = {
			isProduction: document.documentElement.hasAttribute('data-next-is-production'),
			version: document.documentElement.getAttribute('data-next-version'),
			name: document.documentElement.getAttribute('data-next-app')
		};

		// may be used for app specific config in future
		opts = opts || {};

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

		oErrors.init({
			enabled: flags.get('clientErrorReporting') && this.appInfo.isProduction,
			sentryEndpoint: 'https://edb56e86be2446eda092e69732d8654b@app.getsentry.com/32594',
			siteVersion: this.appInfo.version,
			logLevel: flags.get('clientDetailedErrorReporting') ? 'contextonly' : 'off',
			tags: { appName: this.appInfo.name },
			errorBuffer: window.errorBuffer || []
		});

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

		// FT and next tracking
		// TODO - move all this into the main bootstrap file exported by n-ui
		nThirdPartyCode.init(flags, oErrors, this.appInfo);
		if (flags.get('nInstrumentation')) {
			nInstrumentation.init();
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

	bootstrap (callback, opts) {

		waitForCondition('Polyfill', () => {
			this.bootstrapResult = this.init(opts)
				.then(result => {
					let promise = callback(result);
					if (!(promise && typeof promise.then === 'function')) {
						promise = Promise.resolve();
					}
					return promise
						.then(() => {
							document.documentElement.classList.add('js-success');
							// ads and third party tracking
							// TODO - lazy load this
							nThirdPartyCode.initAfterEverythingElse(result.flags);
							dispatchLoadedEvent();
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
		return new Promise((res, rej) => {
			const script = window.ftNextLoadScript(src);
			script.addEventListener('load', res);
			script.addEventListener('error', rej);
		});
	}
}

module.exports = JsSetup;
