function init (flags) {
	require('n-header-footer/header_new').init(flags);

	if (flags.get('fancyDrawer')) {
		require('n-header-footer/drawer').init();
	}

	if (flags.get('meganav')) {
		require('n-header-footer/meganav').init();
	}

	if (flags.get('sectionBreadcrumbs')) {
		require('n-header-footer/breadcrumb').init();
	}
}

module.exports = { init };
