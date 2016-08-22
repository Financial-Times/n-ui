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
	uuid: require('./js/uuid'),
	loadScript: (src) => {
		return new Promise((res, rej) => {
			const script = window.ftNextLoadScript(src);
			script.addEventListener('load', res);
			script.addEventListener('error', rej);
		});
	},
	waitForCondition: (conditionName, action) => {
		return window[`ftNext${conditionName}Loaded`] ?
			action() :
			document.addEventListener(`ftNext${conditionName}Loaded`, action);
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
		const performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
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
