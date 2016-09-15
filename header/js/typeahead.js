/*global fetch*/
const Awesomplete = require('awesomplete');
const utils = require('../../utils');

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
				return Awesomplete.FILTER_CONTAINS(utils.ascii(text.label), utils.ascii(input));
			},
			item: function (text, input) {
				// eslint-disable-next-line
				return Awesomplete.ITEM(utils.ascii(text.label), utils.ascii(input));
			},
			sort: new Function()
		});

		this.target.addEventListener('submit', this.handleSubmit.bind(this));
		this.input.addEventListener('keyup', utils.debounce(this.handleType.bind(this), 300));
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

export default Typeahead;
