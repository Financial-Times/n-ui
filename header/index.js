const OHeader = require('o-header');
const Typeahead = require('./js/typeahead');
const promoHandler = require('./js/promoHandler');
const TypeaheadNew = require('../typeahead');

function init (flags) {
	promoHandler.init(flags);

	new OHeader();

	// initialise separate sticky header
	new OHeader(document.querySelector('[data-o-header--sticky]'));

	const typeaheadElements = document.querySelectorAll('.o-header [data-typeahead], .o-header__drawer [data-typeahead]');

	if (flags.get('typeahead') && typeaheadElements.length) {
		// if (flags.get('searchMultiTypeahead')) {
			for (let i = 0; i < typeaheadElements.length; i++) {
				const form = typeaheadElements[i];
				new TypeaheadNew(form);
			}

		// } else {

		// 	for (let i = 0; i < typeaheadElements.length; i++) {
		// 		let element = typeaheadElements[i]
		// 		new Typeahead( element, `//${window.location.host}/search-suggestions?q=` );
		// 	}
		// }
	}
}

module.exports = { init };
