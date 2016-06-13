// for the purposes of exposing in a shared n-ui bundle
// This will mean webpack can find them in this bundle under n-ui/componentName
module.exports = function (excludes) {
	excludes = excludes || {};
	var entry = {
		'n-ui': 'window.ftNextUi',
		'n-ui/ads': 'window.ftNextUi.ads',
		'n-ui/tracking': 'window.ftNextUi.tracking',
		'n-ui/date': 'window.ftNextUi.date',
		'n-ui/header': 'window.ftNextUi.header',
		'n-ui/promo-messages': 'window.ftNextUi.promoMessages',
		'n-ui/cookie-message': 'window.ftNextUi.cookieMessage',
		'n-ui/welcome-message': 'window.ftNextUi.welcomeMessage',
		'n-ui/message-prompts': 'window.ftNextUi.messagePrompts',
		'n-ui/myft': 'window.ftNextUi.myft',
		'n-ui/utils': 'window.ftNextUi.utils'
	}

	if (!excludes.react) {
		entry['react'] = 'window.ftNextUi.react';
		entry['react-dom'] = 'window.ftNextUi.reactDom';
	}
	return entry
}
