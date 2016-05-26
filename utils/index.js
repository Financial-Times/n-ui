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
	uuid: require('./js/uuid')

};
