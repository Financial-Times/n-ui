function init (flags) {

	if (flags.get('newHeader')) {
		require('n-header-footer/drawer').init();
	} else {
		require('n-header-footer').init(flags);
	}

	if (flags.get('meganav')) {
		require('n-header-footer/meganav').init();
	}

	if (flags.get('sectionBreadcrumbs')) {
		require('n-header-footer/breadcrumb').init();
	}

}

module.exports = { init };
