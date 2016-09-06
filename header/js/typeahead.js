/*global fetch*/
const Awesomplete = require('awesomplete');
const debounce = require('../../utils').debounce;

const MIN_LENGTH = 2;
const DISPLAY_ITEMS = 6;

class Typeahead {

	constructor (target, dataUrl) {
		this.target = target;
		this.input = target.querySelector('input');
		this.context = getParentElDataTrackableValue(target);
		this.dataUrl = dataUrl;

		this.searchTerm = '';

		this.awesomplete = new Awesomplete(this.input, {
			maxItems: DISPLAY_ITEMS,
			filter: function (text, input) {
				// eslint-disable-next-line
				return Awesomplete.FILTER_CONTAINS(latinize(text), latinize(input));
			},
			item: function (text, input) {
				// eslint-disable-next-line
				return Awesomplete.ITEM(latinize(text), latinize(input));
			},
			sort: new Function()
		});

		this.target.addEventListener('submit', this.handleSubmit.bind(this));
		this.input.addEventListener('keyup', debounce(this.handleType.bind(this), 300));
		this.input.addEventListener('awesomplete-select', this.handleSelect.bind(this));
		this.input.addEventListener('focus', this.handleFocus.bind(this));
	}

	handleType () {
		const latestTerm = this.input.value.trim();

		if (this.searchTerm !== latestTerm) {
			this.searchTerm = latestTerm;

			if (this.searchTerm.length >= MIN_LENGTH) {
				this.getSuggestions(this.searchTerm);
			}
		}
	}

	handleSelect (ev) {
		trackSearchEvent(this.context);
		ev.preventDefault();
		window.location.href = ev.text.value;
	}

	handleSubmit () {
		trackSearchEvent(this.context);
	}

	handleFocus () {
		if (this.searchTerm.length >= MIN_LENGTH) {
			this.awesomplete.open();
		}
	}

	getSuggestions (value) {
		return fetch(this.dataUrl + encodeURIComponent(value))
			.then(response => {
				if (!response.ok) {
					throw new Error(response.statusText);
				}

				return response.json();
			})
			.then(suggestions => {
				this.setSuggestions(suggestions);
			});
	}

	setSuggestions (suggestions) {
		this.awesomplete.list = suggestions.map(makeAwesompleteReadable);
	}

}

function getParentElDataTrackableValue (el) {
	if (el.hasAttribute('data-trackable-terminate')) {
		return '';
	} else if (el.parentNode && el.parentNode.getAttribute('data-trackable')) {
		return `-${el.parentNode.getAttribute('data-trackable')}`;
	} else {
		return getParentElDataTrackableValue(el.parentNode);
	};
}

function makeAwesompleteReadable (suggestion) {
	return [ suggestion.name, suggestion.url || `/stream/${suggestion.taxonomy}Id/${suggestion.id}` ];
}

function trackSearchEvent (context) {
	const tracking = new CustomEvent('oTracking.event', {
		detail: {
			category: 'page',
			action: `search-submit${context}`
		},
		bubbles: true
	});

	document.body.dispatchEvent(tracking);
}

// HACK: we should return the normalized `searchLabel` field and provide awesomeplete with that
// TODO: fix the above, see MH.
// This is purposefully quite rubbish to be small, fast and target only the most-problematic chars.
function latinize (text) {
	const replacements = {
		'a': ['à', 'á', 'â', 'ä', 'ã', 'å', 'ā'],
		'ae': ['æ'],
		'c': ['ç', 'č'],
		'e': ['è', 'é', 'ê', 'ë', 'ē'],
		'g': ['ğ'],
		'i': ['î', 'ï', 'í', 'ì', 'ī'],
		'l': ['ł'],
		'n': ['ñ', 'ń'],
		'o': ['ô', 'ö', 'ò', 'ó', 'ø', 'õ', 'ō'],
		'oe': ['œ'],
		's': ['ş', 'š'],
		'ss': ['ß'],
		'u': ['û', 'ü', 'ù', 'ú', 'ū'],
		'z': ['ž']
	};

	Object.keys(replacements).forEach(letter => {
		replacements[letter].forEach(diacritic => {
			text = text.replace(diacritic, letter);
		});
	});

	return text;
}

export default Typeahead;
