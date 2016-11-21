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
			sort: (a, b) => {
				return this.awesomplete.suggestionsWeighting[b.value] - this.awesomplete.suggestionsWeighting[a.value];
			}
		});

		this.target.addEventListener('submit', this.handleSubmit.bind(this));
		this.input.addEventListener('keyup', utils.debounce(this.handleType.bind(this), 300));
		this.input.addEventListener('awesomplete-select', this.handleSelect.bind(this));
		this.input.addEventListener('awesomplete-close', this.handleClose.bind(this));
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
		this.trackSearchEvent({type: 'select', item: ev.text});
		ev.preventDefault();
		window.location.href = ev.text.value;
	}

	handleClose (ev) {
		this.trackSearchEvent({type: 'close', close_reason: ev.reason});
	}

	handleSubmit () {
		this.trackSearchEvent({type: 'submit'});
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
		// HACK: Assigning to this.awesomplete.list will instantly sort, and it's not
		// possible to pass the weighting into a list value! So keep track of the
		// weighting separately.
		this.awesomplete.suggestionsWeighting = {};
		this.awesomplete.list = suggestions.map(suggestion => {
			const url = suggestion.url || `/stream/${suggestion.taxonomy}Id/${suggestion.id}`;
			this.awesomplete.suggestionsWeighting[url] = suggestion.count;
			return [ suggestion.name, url];
		});
	}

	trackSearchEvent ({type, close_reason = null, item = null}) {
		const tracking = new CustomEvent('oTracking.event', {
			detail: {
				category: 'page',
				action: `search-submit${this.context}`,
				search_type: type,
				search_close_reason: close_reason,
				search_item_label: item && item.label,
				search_item_value: item && item.value,
				search_term: this.searchTerm,
				search_result_index: this.awesomplete.index,
				search_results_length: this.awesomplete.suggestions && this.awesomplete.suggestions.length,
			},
			bubbles: true
		});

		document.body.dispatchEvent(tracking);
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

export default Typeahead;
