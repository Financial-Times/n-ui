import ads from '../../components/n-ui/ads';

const flags = Object.assign(window.FT.flags, {
	get: function (name) {
		return this[name];
	},
	getAll: function () {
		return this;
	}
});

if(flags.get('oAdsSplitBundle')) {
	const appInfo = {
		isProduction: document.documentElement.hasAttribute('data-next-is-production'),
		version: document.documentElement.getAttribute('data-next-version'),
		name: document.documentElement.getAttribute('data-next-app'),
		product: document.documentElement.getAttribute('data-next-product')
	};

	const shouldEnableAds = window.FT.nUiConfig.preset === 'complete';

	if (shouldEnableAds) {
		ads.init(flags, appInfo, shouldEnableAds);
	}
}
