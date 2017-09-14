// for the purposes of exposing in a shared n-ui bundle
// This will mean webpack can find them in this bundle under n-ui/componentName
module.exports = function (exclusions) {
	const entry = {
		// n-ui components
		'n-ui': 'window.ftNextUi',
		'n-ui/ads': 'window.ftNextUi._ads',
		'n-ui/tracking': 'window.ftNextUi._tracking',
		'n-ui/components/n-ui/ads': 'window.ftNextUi._ads',
		'n-ui/components/n-ui/tracking': 'window.ftNextUi._tracking',
		'n-ui-foundations': 'window.ftNextUi._foundations',
		// wrapped origami components
		'o-date': 'window.ftNextUi._date',
		'o-grid': 'window.ftNextUi._grid',
		'o-viewport': 'window.ftNextUi._viewport',
		'n-image': 'window.ftNextUi._image',

		// other components
		'ftdomdelegate': 'window.ftNextUi._ftdomdelegate',
		'superstore': 'window.ftNextUi._superstore',
		'superstore-sync': 'window.ftNextUi._superstoreSync',
	};

	if (exclusions) {
		exclusions.forEach(exc => delete entry[exc]);
	}

	return entry;
};
