module.exports = {
	"defaults": {
		"timeout": 1000,
		"page": {
			"viewport": {
				"width": 320,
				"height": 480
			}
		}
	},
	"urls": [
		{
			"url": "https://n-ui.ft.com/n-ui/test-page/" + process.env.CIRCLE_BUILD_NUM + "/test-page.html",
			"timeout": 10000
		}
	]
}
