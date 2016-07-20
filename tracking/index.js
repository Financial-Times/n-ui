module.exports = {
	init: function (flags, appInfo) {
		require('./ft').init(flags, appInfo);
	},
	lazyInit: function (flags) {
		window.addEventListener('ftNextLoaded', function () {
			require('./third-party/floodlight')(flags);
			require('./third-party/inspectlet')(flags);
			require('./third-party/mouseflow')(flags);
			require('./third-party/sourcepoint')(flags);
		});
	}
};
