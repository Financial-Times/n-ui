const OHeader = require('o-header');
const Typeahead = require('./js/typeahead');
const promoHandler = require('./js/promoHandler');
const TypeaheadNew = require('../typeahead');

function init (flags) {
	promoHandler.init(flags);

	new OHeader();

	// initialise separate sticky header
	new OHeader(document.querySelector('[data-o-header--sticky]'));

	const typeaheadElements = document.querySelectorAll('[data-typeahead]');

	if (flags.get('typeahead') && typeaheadElements.length) {
		if (flags.get('searchMultiTypeahead')) {
			for (let i = 0; i < typeaheadElements.length; i++) {
				const form = typeaheadElements[i];
				const type = form.getAttribute('data-typeahead-type') || 'suggestions';

				new TypeaheadNew(form, type);
			}

		} else {

			for (let i = 0; i < typeaheadElements.length; i++) {
				let element = typeaheadElements[i]
				new Typeahead( element, `//${window.location.host}/search-suggestions?q=` );
			}
		}
	}
}

module.exports = { init };
