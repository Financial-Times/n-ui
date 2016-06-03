module.exports = {
	init: function (flags, appInfo) {
		require('./js/ft/o-tracking-wrapper').init(flags, appInfo);
	},
	lazyInit: function (flags) {
		window.addEventListener('ftNextLoaded', function () {
			require('./js/third-party/floodlight')(flags);
			require('./js/third-party/inspectlet')(flags);
			require('./js/third-party/sourcepoint')(flags);
			require('./js/third-party/adblocking')(flags);
		});
	}
};
