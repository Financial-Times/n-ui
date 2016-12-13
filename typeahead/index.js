/*global fetch*/
const Delegate = require('ftdomdelegate');
const debounce = require('../utils').debounce;
import { SuggestionList } from './suggestion-list';

const React = require('react');
const ReactDom = require('react-dom');

function getNonMatcher (container) {
	if (typeof container === 'string') {
		return function (el) {
			return el && el !== document && !el.matches(container);
		};
	}

	return function (el) {
		return el && el !== document && el !== container;
	};
}

function isOutside (el, container) {
	const doesntMatch = getNonMatcher(container);

	while (doesntMatch(el)) {
		el = el.parentNode;
	}

	return !el || el === document;
}

class Typeahead {
	constructor (containerEl) {
		this.container = containerEl;
		this.searchEl = this.container.querySelector('input[type="text"]');
		this.submitButton = this.container.querySelector('button[type="submit"]')
		this.dataSrc = `//${window.location.host}/search-api/suggestions?partial=`;
		this.minLength = 2;
		this.init();
	}

	init () {
		this.suggestions = [];
		this.suggestionListContainer = document.createElement('div');
		this.container.insertBefore(this.suggestionListContainer, this.submitButton);
		this.suggestionsView = ReactDom.render(<SuggestionList/>, this.suggestionListContainer);
		this.searchTermHistory = [];

		this.delegate = new Delegate(this.container);
		this.bodyDelegate = new Delegate(document.body);
		this.suggest = this.suggest.bind(this);
		this.onType = debounce(this.onType, 150).bind(this);
		this.onDownArrow = this.onDownArrow.bind(this);
		this.onSuggestionKey = this.onSuggestionKey.bind(this);

		this.delegate.on('keyup', 'input[type="text"]', (ev) => {
			switch(ev.which) {
				case 13 : return; // enter
				case 9 : return; // tab
				case 27: //esc
					this.hide();
				break;
				case 40 :
					this.onDownArrow(ev);
				break;
				default :
					this.onType(ev);
				break;
			}
		});


		this.delegate.on('focus', 'input[type="text"]', (ev) => {
			ev.target.setSelectionRange ? ev.target.setSelectionRange(0, ev.target.value.length) : ev.target.select();
			this.show();
		});


		this.delegate.on('click', 'input[type="text"]', (ev) => {
			ev.target.setSelectionRange ? ev.target.setSelectionRange(0, ev.target.value.length) : ev.target.select();
			this.show();
		});

		this.delegate.on('keyup', '.o-header__typeahead a, .o-header__typeahead button[type="submit"]', this.onSuggestionKey);
		// prevent scroll to item
		this.delegate.on('keydown', 'input, .o-header__typeahead a', ev => {
			if (ev.which === 40 || ev.which === 38) {
				ev.preventDefault();
			}
		})
	}

	// EVENT HANDLERS
	onType () {
		this.searchTerm = this.searchEl.value.trim();
		this.searchTermHistory.push(this.searchTerm);
		this.getSuggestions(this.searchTerm);
		[].forEach.call(this.suggestionListContainer.querySelectorAll('li'), function (el) {
			el.setAttribute('data-trackable-meta', '{"search-term":"' + this.searchTerm + '"}');
		}.bind(this));
	}

	onDownArrow () {
		this.suggestionLinks = Array.from(this.suggestionListContainer.querySelectorAll('a'));
		if (this.suggestionLinks.length) {
			this.suggestionLinks[0].focus();
		}
	}

	onSuggestionKey (ev) {
		if (ev.which === 13) { // Enter pressed
			ev.stopPropagation();
			// we don't prevent default as the link's url is a link to the search page
			return;
		}

		if (ev.which === 40) { // down arrow pressed
			const index = this.suggestionLinks.indexOf(ev.target);
			const newIndex = index + 1;
			if (newIndex < this.suggestionLinks.length) {
				this.suggestionLinks[newIndex].focus();
			} else {
				this.suggestionLinks[0].focus();
			}
			return;
		}

		if (ev.which === 38) { // up arrow pressed
			const index = this.suggestionLinks.indexOf(ev.target);
			const newIndex = index - 1;
			if (newIndex < 0) {
				this.searchEl.focus();
			} else {
				this.suggestionLinks[newIndex].focus();
			}
		}
	}

	// INTERNALS
	getSuggestions (value) {
		if (value.length >= this.minLength) {
			fetch(this.dataSrc + encodeURIComponent(value))
				.then((response) => {
					if (!response.ok) {
						throw new Error(response.statusText);
					}
					return response.json();
				})
				.then(this.suggest)
				.catch((err) => {
					setTimeout(() => {
						throw err;
					});
				});
		} else {
			this.unsuggest();
		}
	}

	isTimelyResponse (term) {
		// handle race conditions between e.g. TRU returning slower than TRUMP
		const index = this.searchTermHistory.indexOf(term);
		if (index > -1) {
			this.searchTermHistory = this.searchTermHistory.slice(index);
			return true;
		}
		return false;
	}

	suggest (suggestions) {

		if (!suggestions.query || !this.isTimelyResponse(suggestions.query.partial)) {
			return;
		}
		this.suggestions = suggestions;
		this.suggestionsView.setState({
			searchTerm: this.searchTerm,
			suggestions: this.suggestions
		});
		this.show();
	}

	unsuggest () {
		this.hide();
	}

	hide () {
		this.suggestionListContainer.setAttribute('hidden', '');
		this.bodyDelegate.off();
	}

	show () {
		this.suggestionListContainer.removeAttribute('hidden');
		['focus', 'touchstart', 'mousedown']
			.forEach(type => {
				this.bodyDelegate.on(type, (ev) => {
					if (isOutside(ev.target, this.container)) {
						this.hide();
					}
				});
			})
	}
}

export default Typeahead;
