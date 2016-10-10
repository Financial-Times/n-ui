module.exports = {
	"urls": [
		{
			"url": "https://n-ui.ft.com/n-ui/test-page/" + process.env.CIRCLE_BUILD_NUM + "/test-page.html",
			"timeout": 10000
		},
		{
			"url": "https://n-ui.ft.com/n-ui/test-page/" + process.env.CIRCLE_BUILD_NUM + "/test-page.html",
			"timeout": 10000,
			"page": {
				"viewport": {
					"width": 768,
					"height": 1024
				}
			}
		},
		{
			"url": "https://n-ui.ft.com/n-ui/test-page/" + process.env.CIRCLE_BUILD_NUM + "/test-page.html",
			"timeout": 10000,
			"page": {
				"viewport": {
					"width": 490,
					"height": 732
				}
			}
		},
		{
			"url": "https://n-ui.ft.com/n-ui/test-page/" + process.env.CIRCLE_BUILD_NUM + "/test-page.html",
			"timeout": 10000,
			"page": {
				"viewport": {
					"width": 320,
					"height": 480
				}
			}
		}
	]
}
