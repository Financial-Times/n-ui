/*eslint no-console: 0*/

module.exports = {
	'js-success test': browser => {
		const testUrl = `https://n-ui.ft.com/n-ui/test-page/${process.env.CIRCLE_BUILD_NUM}/test-page.html`;
		console.log(`Launching ${testUrl}`);
		browser
			.url(testUrl)
			.waitForElementPresent('html.enhanced.js-success', 60000);
	},
};
