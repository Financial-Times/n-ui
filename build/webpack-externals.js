// for the purposes of exposing in a shared n-ui bundle
// This will mean webpack can find them in this bundle under n-ui/componentName
module.exports = function (exclusions) {
	const entry = {
		// n-ui components
		'n-ui': 'window.FT.nUi',
		'n-ui-foundations': 'window.FT.nUi._hiddenComponents.nUiFoundations',
		// wrapped origami components
		'o-date': 'window.FT.nUi.._hiddenComponents.oDate',
		'o-grid': 'window.FT.nUi._hiddenComponents.oGrid',
		'o-viewport': 'window.FT.nUi._hiddenComponents.oViewport',
		'n-image': 'window.FT.nUi._hiddenComponents.nImage',

		// other components
		'ftdomdelegate': 'window.FT.nUi._hiddenComponents.ftdomdelegate',
		'superstore': 'window.FT.nUi._hiddenComponents.superstore',
		'superstore-sync': 'window.FT.nUi._hiddenComponents.superstoreSync',
	};

	if (exclusions) {
		exclusions.forEach(exc => delete entry[exc]);
	}

	return entry;
};
