const Typeahead = require('./js/typeahead');
const promoHandler = require('./js/promoHandler');

function init (flags) {
	require('o-header').init();
	promoHandler.init(flags);

	if (flags.get('fancyDrawer')) {
		require('n-header-footer/drawer').init();
	}

	if (flags.get('sectionBreadcrumbs')) {
		require('n-header-footer/breadcrumb').init();
	}

	const typeaheadElements = document.querySelectorAll('[data-typeahead]');
	if (flags.get('typeahead') && typeaheadElements.length) {
		for (let i = 0; i < typeaheadElements.length; i++) {
			let element = typeaheadElements[i]
			new Typeahead( element, `//${window.location.host}/search-suggestions?q=` );
		}
	}
}

module.exports = { init };
