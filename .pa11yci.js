const viewports = [
	{
		width: 768,
		height: 1024
	},
	{
		width: 490,
		height: 732
	},
	{
		width: 320,
		height: 480
	}
];

const urls = [
	`https://n-ui.ft.com/n-ui/test-page/${process.env.CIRCLE_BUILD_NUM}/test-page.html`
]

const config = {
	defaults: {
		page: {
			headers: {
				"Cookie": "next-flags=ads:off,cookieMessage:off,nTeaserStreamPage:on; secure=true"
			}
		},
		timeout: 25000
	},
	urls: []
}

for (viewport of viewports) {
	for (url of urls) {
		config.urls.push({
			url: url,
			viewport: viewport
		})
	}
}

module.exports = config;
