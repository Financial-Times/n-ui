module.exports = {
	handlebarsData: {
		template: 'wrapper',
		layout: null
	},
	pa11yData: [
		{
			rootElement: 'html',
			hideElements: '.n-skip-link, iframe[src*=doubleclick]',
			page: {
				headers: {
					'FT-Flags': 'ads:off,javascript:off'
				}
			}
		},
		{
			rootElement: 'html',
			hideElements: '.n-skip-link, iframe[src*=doubleclick]',
			page: {
				headers: {
					'FT-Flags': 'ads:off,javascript:on'
				}
			}
		}
	]
};
