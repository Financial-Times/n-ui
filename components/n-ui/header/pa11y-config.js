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
					'FT-Flags': 'ads:off,sourcepoint:off,javascript:on'
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
		},
		{
			rootElement: '.n-layout__row--header',
			// Hide elements that depend on other components’ markup
			hideElements: '.n-skip-link, [href="#o-header-drawer"]',
			page: {
				headers: {
					'FT-Anonymous-User': true,
					'FT-Flags': 'ads:off,sourcepoint:off,javascript:on'
				}
			}
		},
		{
			rootElement: '.n-layout__row--header',
			// Hide elements that depend on other components’ markup
			hideElements: '.n-skip-link, [href="#o-header-drawer"]',
			page: {
				headers: {
					'FT-Anonymous-User': true,
					'FT-Flags': 'ads:off,javascript:off'
				}
			}
		}
	]
};
