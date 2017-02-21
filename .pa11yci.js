const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const error = chalk.bold.red;

const config = {
	defaults: {
		timeout: 10000,
		page: {
			headers: {
				Cookie: 'next-flags=ads:off,cookieMessage:off; secure=true'
			}
		}
	},
	urls: [
		'http://localhost:5005'
	]
};

const pa11yIgnore = [
	'.git',
	'.idea',
	'node_modules',
	'bower_components',
	'public',
	'_deploy',
	'_sass-utils',
	'_test-server',
	'ads',
	'buttons',
	'colors',
	'cookie-message',
	'date',
	'dist',
	'expander',
	'forms',
	'grid',
	'icons',
	'js-setup',
	'myft',
	'myft-common',
	'myft-digest-promo',
	'myft-hint',
	'n-ui',
	'node',
	'normalize',
	'notification',
	'offline-toast',
	'opt-out',
	'overlay',
	'page-heading',
	'subscription-offer-prompt',
	'test',
	'tour-tip',
	'tour-tip-group',
	'tooltip',
	'tracking',
	'typeahead',
	'typography',
	'utils',
	'viewport',
	'syndication'
];

function getDirectories (srcpath) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory() && pa11yIgnore.indexOf(file) < 0;
	});
}

const missingPa11yConfig = [];
const components = getDirectories('./');
const cloneData = (data) => JSON.parse(JSON.stringify(data));

components.forEach((component) => {
	let componentConfig;

	try {
		componentConfig = require(`./${component}/pa11y-config.js`);

		if(!componentConfig.pa11yData.length) {
			throw new Error();
		}

	} catch (e) {
		return missingPa11yConfig.push(component);
	};

	const componentDefaults = {
		url: `localhost:5005/components/${component}`,
		rootElement: 'body'
	};
	const componentPa11yData = cloneData(componentConfig.pa11yData || []);
	const mergeWithDefaults = (data) => Object.assign({}, componentDefaults, data);
	const componentUrls = componentPa11yData.map(mergeWithDefaults);
	const addToPa11yUrls = (componentUrls) => componentUrls.map((url) => config.urls.push(url));

	addToPa11yUrls(componentUrls);
});

if(missingPa11yConfig.length) {
	throw new Error(error(`Components need to have a demo-config.js file, containing a non-empty \`pa11yData\` array. Components without these are: ${missingPa11yConfig.join(', ')}.`));
}

module.exports = config;
