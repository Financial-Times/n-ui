/*eslint no-console: 0*/

module.exports = {
	'js-success test': browser => {
		const testUrl = `http://ft-next-n-ui-prod.s3-website-eu-west-1.amazonaws.com/n-ui/test-page/${process.env.CIRCLE_BUILD_NUM}/test-page.html`;
		console.log(`Launching ${testUrl}`);
		browser
			.url(testUrl)
			.waitForElementPresent('html.enhanced.js-success', 60000);
	},
};
