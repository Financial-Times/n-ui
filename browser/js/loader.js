// for safety polyfill window.console
if (!window.console) {
	window.console = {};
	const methods = ['info', 'log', 'warn', 'error'];
	for (let i = 0; i < methods.length; i++) {
		window.console[methods[i]] = function () {};
	}
}

import { loadScript, waitForCondition } from './utils';
import { perfMark, broadcast } from 'n-ui-foundations';

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

		this.appInfo = {
			isProduction: document.documentElement.hasAttribute('data-next-is-production'),
			version: document.documentElement.getAttribute('data-next-version'),
			name: document.documentElement.getAttribute('data-next-app'),
			product: document.documentElement.getAttribute('data-next-product')
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

		return Promise.resolve({
			flags: flags,
			appInfo: this.appInfo,
			allStylesLoaded: new Promise(res => {
				// if this element exists it means the page is setup to deliver critical/main css
				if (document.querySelector('style.n-layout-head-css')) {
					waitForCondition('AllStyles', res);
				} else {
					res();
				}
			})
		});
	}

	bootstrap (opts, callback) {
		opts = opts || {};
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

				broadcast('oErrors.log', {
					error: err,
					info: {
						lifecycle: 'app initialisation'
					}
				});
			});
	}

	loadScript (src) {
		return loadScript(src);
	}
}

module.exports = JsSetup;
