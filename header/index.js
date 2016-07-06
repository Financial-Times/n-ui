const Typeahead = require('./typeahead');

function init (flags) {
	require('o-header').init();

	if (flags.get('fancyDrawer')) {
		require('n-header-footer/drawer').init();
	}

	if (flags.get('sectionBreadcrumbs')) {
		require('n-header-footer/breadcrumb').init();
	}

	// TODO: refactor into for...loop
	const typeaheadEls = [...document.querySelectorAll('[data-typeahead]')];
	if (flags.get('typeahead') && typeaheadEls.length) {
		typeaheadEls.forEach(function (element) {
			new Typeahead(
				element,
				'//' + window.location.host + '/search-suggestions?q='
			);
		});
	}
}

module.exports = { init };
