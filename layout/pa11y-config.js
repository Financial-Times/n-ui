module.exports = {
	handlebarsData: {
		template: 'wrapper',
		layout: null
	},
	pa11yData: [
		{
			rootElement: 'html',
			hideElements: '.n-skip-link',
			page: {
				headers: {
					'FT-Flags': 'ads:off,cookieMessage:on,javascript:off'
				}
			}
		},
		{
			rootElement: 'html',
			hideElements: '.n-skip-link',
			page: {
				headers: {
					'FT-Flags': 'ads:off,cookieMessage:on,javascript:on'
				}
			}
		}
	]
};
