module.exports = {
	init: function (flags, appInfo) {
		require('./ft').init(flags, appInfo);
	},
	lazyInit: function (flags) {
		window.addEventListener('ftNextLoaded', function () {
			require('./third-party/floodlight')(flags);
		});
	},
	scrollDepthComponents: require('./ft/events/scroll-depth-components'),
	scrollDepth: require('./ft/events/scroll-depth'),
	audioTeaserView: require('./ft/events/audio-teaser-view')
};
