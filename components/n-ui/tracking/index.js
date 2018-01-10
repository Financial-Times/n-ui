module.exports = {
	init: function (flags, appInfo) {
		require('./ft').init(flags, appInfo);
	},
	lazyInit: function (flags) {
		window.addEventListener('ftNextLoaded', function () {
			require('./third-party/speedcurve-lux')(flags);
			require('./third-party/floodlight')(flags);
			require('./third-party/chartbeat')(flags);
		});
	},
	scrollDepthComponents: require('./ft/events/scroll-depth-components'),
	scrollDepth: require('./ft/events/scroll-depth')

};
