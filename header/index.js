const OHeader = require('o-header');
const Typeahead = require('./js/typeahead');
const promoHandler = require('./js/promoHandler');
const TypeaheadOld = require('./js/typeahead-old');


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
				const input = form.querySelector('input');

				const typeahead = new TypeaheadOld(
					form,
					input,
					'//' + window.location.host + '/search-suggestions?flatten=true&limit=5&q=',
					function() {
						form.submit();
					}
				);
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
