/*
	n-ui webpack config
	externals configuration -
	creates a appshell bundle with common modules
	across all apps, version-controlled by n-ui

	webpack looks for components in the appshell (n-ui) bundle,
	under n-ui/componentName
*/

module.exports = {
	externals: {
		// n-ui components
		'n-ui': 'window.FT.nUi',
		'n-ui-foundations': 'window.FT.nUi._hiddenComponents.nUiFoundations',

		// wrapped origami components
		'o-date': 'window.FT.nUi._hiddenComponents.oDate',
		'o-ads': 'window.FT.nUi._hiddenComponents.oAds',
		'o-tracking': 'window.FT.nUi._hiddenComponents.oTracking',
		'o-grid': 'window.FT.nUi._hiddenComponents.oGrid',
		'o-viewport': 'window.FT.nUi._hiddenComponents.oViewport',
		'n-image': 'window.FT.nUi._hiddenComponents.nImage',

		// other components
		'ftdomdelegate': 'window.FT.nUi._hiddenComponents.ftdomdelegate',
		'superstore': 'window.FT.nUi._hiddenComponents.superstore',
		'superstore-sync': 'window.FT.nUi._hiddenComponents.superstoreSync'
	}
};
