// for the purposes of exposing in a shared n-ui bundle
// This will mean webpack can find them in this bundle under n-ui/componentName
module.exports = function (withPreact, exclusions) {
	const entry = {
		// n-ui components
		'n-ui': 'window.ftNextUi',
		'n-ui/ads': 'window.ftNextUi._ads',
		'n-ui/tracking': 'window.ftNextUi._tracking',
		'n-ui/tabbing': 'window.ftNextUi._tabbing',
		'n-ui/notification': 'window.ftNextUi._notification',
		'n-ui/myft': 'window.ftNextUi._myft',
		'n-ui/typeahead': 'window.ftNextUi._typeahead',
		'n-ui-foundations': 'window.ftNextUi._foundations',
		'n-ui/myft-digest-promo': 'window.ftNextUi._myftDigestPromo',
		'n-ui/myft-hint': 'window.ftNextUi._myftHint',
		// wrapped origami components
		'o-date': 'window.ftNextUi._date',
		'o-grid': 'window.ftNextUi._grid',
		'o-viewport': 'window.ftNextUi._viewport',
		'n-image': 'window.ftNextUi._image',

		// other components
		'ftdomdelegate': 'window.ftNextUi._ftdomdelegate',
		'superstore': 'window.ftNextUi._superstore',
		'superstore-sync': 'window.ftNextUi._superstoreSync',
	}

	if (withPreact) {
		entry.react = 'window.ftNextUi._React';
		entry['react-dom'] = 'window.ftNextUi._ReactDom';
	}

	if (exclusions) {
		exclusions.forEach(exc => delete entry[exc]);
	}

	return entry;
}
