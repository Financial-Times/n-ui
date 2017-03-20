module.exports = {
	handlebarsData: {
		template: 'template'
	},
	pa11yData: [
		{
			rootElement: '.n-layout__row--header',
			// Hide elements that depend on other components’ markup
			hideElements: '.n-skip-link, [href="#o-header-drawer"]',
			page: {
				headers: {
					'FT-Flags': 'ads:off,javascript:on,sourcepoint:off'
				}
			}
		},
		{
			rootElement: '.n-layout__row--header',
			// Hide elements that depend on other components’ markup
			hideElements: '.n-skip-link, [href="#o-header-drawer"]',
			page: {
				headers: {
					'FT-Flags': 'ads:off,javascript:off'
				}
			}
		}
	]
};
