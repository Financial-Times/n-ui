const OHeader = require('o-header');
const promoHandler = require('./js/promoHandler');
const Typeahead = require('../typeahead');

function init (flags) {
	promoHandler.init(flags);

	new OHeader();

	// initialise separate sticky header
	new OHeader(document.querySelector('[data-o-header--sticky]'));

	const typeaheadElements = document.querySelectorAll('.o-header [data-typeahead], .o-header__drawer [data-typeahead]');

	if (flags.get('searchMultiTypeahead') && typeaheadElements.length) {
		for (let i = 0; i < typeaheadElements.length; i++) {
			const form = typeaheadElements[i];
			new Typeahead(form);
		}
	}
}

module.exports = { init };
