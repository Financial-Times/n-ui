const config = {
	defaults: {
		timeout: 10000,
		page: {
			headers: {
				Cookie: 'next-flags=ads:off,cookieMessage:off;secure=true'
			}
		},
		rules: ['Principle1.Guideline1_3.1_3_1_AAA']
	},
	urls: [
		'http://localhost:5005'
	]
};

const components = [
	'components/n-ui/header',
	'components/n-ui/footer',
	'components/n-ui/compact-view-promo'
]

const cloneData = (data) => JSON.parse(JSON.stringify(data));

const path = ci ? 'https://n-ui.ft.com/n-ui/test-page/' : 'localhost:5005/'

components.forEach((component) => {
	const componentConfig = require(`./${component}/pa11y-config.js`);

	const componentDefaults = {
		url: `http://localhost:5005/${component}`,
		rootElement: 'body'
	};
	const componentPa11yData = cloneData(componentConfig.pa11yData || []);
	const mergeWithDefaults = (data) => Object.assign({}, componentDefaults, data);
	const componentUrls = componentPa11yData.map(mergeWithDefaults);
	const addToPa11yUrls = (componentUrls) => componentUrls.map((url) => config.urls.push(url));

	addToPa11yUrls(componentUrls);
});

module.exports = config;
