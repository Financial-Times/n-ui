function init (flags) {

	if (flags.get('newHeader')) {
		require('n-header-footer/header_new').init();

		// TODO: flag this
		require('n-header-footer/drawer').init();

		if (flags.get('meganav')) {
			require('n-header-footer/meganav').init();
		}
	} else {
		require('n-header-footer').init(flags);
	}


	if (flags.get('sectionBreadcrumbs')) {
		require('n-header-footer/breadcrumb').init();
	}

}

module.exports = { init };
