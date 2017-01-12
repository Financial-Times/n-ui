const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const error = chalk.bold.red;

const config = {
	"defaults": {
		"timeout": 10000,
		"page": {
			"headers": {
				"Cookie": "next-flags=ads:off,cookieMessage:off; secure=true"
			}
		},
		"rootElement": "#a11y"
	},
	"urls": [
		"http://localhost:5005"
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
	'header',
	'icons',
	'js-setup',
	'layout',
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
	'welcome-message',
	'syndication'
];

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory() && pa11yIgnore.indexOf(file) < 0;
	});
}

const missingPa11yConfig = [];
const components = getDirectories('./');

components.forEach((component) => {
	let componentConfig;

	try {
		componentConfig = require(`./${component}/pa11y-config.js`);
	} catch (e) {
		return missingPa11yConfig.push(component);
	};

	config.urls.push({
		url: `localhost:5005/components/${component}`
	});
});

if(missingPa11yConfig.length) {
	throw new Error(error(`Error: Components need to have a pa11y-config, components missing a pa11y-config: ${missingPa11yConfig.join()}`));
}

module.exports = config;
