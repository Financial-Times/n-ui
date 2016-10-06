// tricky recursive function, but it works
function uuid (a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)}

module.exports = {
	$: function (sel, ctx) { return (ctx || document).querySelector(sel) },
	$$: function (sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel))},
	debounce: function (func, wait) {
		let timeout;
		return function () {
			const args = arguments;
			const later = () => {
				timeout = null;
				func.apply(this, args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	},

	throttle: function (func, wait) {
		let timeout;
		return function () {
			if (timeout) {
				return;
			}
			const args = arguments;
			const later = () => {
				timeout = null;
				func.apply(this, args);
			};

			timeout = setTimeout(later, wait);
		};
	},
	uuid: uuid,
	ascii: require('./js/to-ascii'),
	loadScript: (src) => {
		return new Promise((res, rej) => {
			const script = window.ftNextLoadScript(src);
			script.addEventListener('load', res);
			script.addEventListener('error', rej);
		});
	},
	waitForCondition: (conditionName, action) => {
		window[`ftNext${conditionName}Loaded`] ? action() : document.addEventListener(`ftNext${conditionName}Loaded`, action)
	},
	broadcast: (name, data, bubbles = true) => {
		const rootEl = document.body;
		const event = (function () {
			try {
				return new CustomEvent(name, {bubbles: bubbles, cancelable: true, detail: data});
			} catch (e) {
				return CustomEvent.initCustomEvent(name, true, true, data);
			}
		}());

		rootEl.dispatchEvent(event);
	},
	perfMark: name => {
		const performance = window.LUX || window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
		if (performance && performance.mark) {
			performance.mark(name);
		}
	},
	getCookieValue: key => {
		const regex = new RegExp(`${key}=([^;]+)`, 'i');
		const a = regex.exec(document.cookie);
		return (a) ? a[1] : undefined;
	}

};
