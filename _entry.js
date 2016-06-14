// for the purposes of exposing in a shared n-ui bundle
// This will mean webpack can find them in this bundle under n-ui/componentName
module.exports = function (excludes) {
	excludes = excludes || {};
	var entry = {
		'n-ui': 'window.ftNextUi',
		'n-ui/ads': 'window.ftNextUi._ads',
		'n-ui/tracking': 'window.ftNextUi._tracking',
		'n-ui/date': 'window.ftNextUi._date',
		'n-ui/header': 'window.ftNextUi._header',
		'n-ui/promo-messages': 'window.ftNextUi._promoMessages',
		'n-ui/cookie-message': 'window.ftNextUi._cookieMessage',
		'n-ui/welcome-message': 'window.ftNextUi._welcomeMessage',
		'n-ui/message-prompts': 'window.ftNextUi._messagePrompts',
		'n-ui/myft': 'window.ftNextUi._myft',
		'n-ui/utils': 'window.ftNextUi._utils'
	}

	if (!excludes.react) {
		entry['react'] = 'window.ftNextUi.react';
		entry['react-dom'] = 'window.ftNextUi.reactDom';
	}
	return entry
}
