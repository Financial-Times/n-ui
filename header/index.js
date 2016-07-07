const Typeahead = require('./typeahead');

function init (flags) {
	require('o-header').init();

	if (flags.get('fancyDrawer')) {
		require('n-header-footer/drawer').init();
	}

	if (flags.get('sectionBreadcrumbs')) {
		require('n-header-footer/breadcrumb').init();
	}

	const typeaheadElements = document.querySelectorAll('[data-typeahead]');
	if (flags.get('typeahead') && typeaheadElements.length) {
		for (const element of typeaheadElements) {
			new Typeahead( element, `//{window.location.host}/search-suggestions?q=` );
		};
	}
}

module.exports = { init };
