// for the purposes of exposing in a shared n-ui bundle
// This will mean webpack can find them in this bundle under n-ui/componentName
module.exports = function (withPreact) {
	const entry = {
		// n-ui components
		'n-ui': 'window.ftNextUi',
		'n-ui/ads': 'window.ftNextUi._ads',
		'n-ui/tracking': 'window.ftNextUi._tracking',
		'n-ui/header': 'window.ftNextUi._header',
		'n-ui/footer': 'window.ftNextUi._footer',
		'n-ui/promo-messages': 'window.ftNextUi._promoMessages',
		'n-ui/cookie-message': 'window.ftNextUi._cookieMessage',
		'n-ui/welcome-message': 'window.ftNextUi._welcomeMessage',
		'n-ui/message-prompts': 'window.ftNextUi._messagePrompts',
		'n-ui/notification': 'window.ftNextUi._notification',
		'n-ui/myft': 'window.ftNextUi._myft',
		'n-ui/utils': 'window.ftNextUi._utils',
		// wrapped origami components
		'n-ui/date': 'window.ftNextUi._date',
		'o-date': 'window.ftNextUi._date',
		'n-ui/expander': 'window.ftNextUi._expander',
		'o-expander': 'window.ftNextUi._expander',
		'n-ui/grid': 'window.ftNextUi._grid',
		'o-grid': 'window.ftNextUi._grid',
		'n-ui/overlay': 'window.ftNextUi._overlay',
		'o-overlay': 'window.ftNextUi._overlay',
		'n-ui/viewport': 'window.ftNextUi._viewport',
		'o-viewport': 'window.ftNextUi._viewport',
		'o-video': 'window.ftNextUi._video',

		// other components
		'ftdomdelegate': 'window.ftNextUi._ftdomdelegate',
		'superstore': 'window.ftNextUi._superstore',
		'superstore-sync': 'window.ftNextUi._superstoreSync',
	}

	if (withPreact) {
		entry.react = 'window.ftNextUi._React';
		entry['react-dom'] = 'window.ftNextUi._ReactDom';
	}
	return entry;
}
