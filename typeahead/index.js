/*global fetch*/
const Delegate = require('ftdomdelegate');
import { debounce } from '../utils';
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
	constructor (containerEl, listComponent) {
		this.container = containerEl;
		this.listComponent = listComponent || SuggestionList;
		this.searchEl = this.container.querySelector('input[type="text"]');
		this.dataSrc = `//${window.location.host}/search-api/suggestions?partial=`;
		this.categories = (this.container.getAttribute('data-typeahead-categories') || 'tags').split(',');
		this.itemTag = this.container.getAttribute('data-typeahead-item-tag') || 'a';
		this.includeViewAllLink = this.container.hasAttribute('data-typeahead-view-all');
		this.minLength = 2;
		this.init();
	}

	init () {
		this.suggestions = [];
		this.suggestionListContainer = document.createElement('div');
		this.searchEl.parentNode.insertBefore(this.suggestionListContainer, null);
		// TO DO allow passing a preact component of choice in in stead of suggestion list
		this.suggestionsView = ReactDom.render(<this.listComponent
			categories={this.categories}
			itemTag={this.itemTag}
			includeViewAllLink={this.includeViewAllLink}
			searchEl={this.searchEl}
		/>, this.suggestionListContainer);
		this.searchTermHistory = [];

		this.bodyDelegate = new Delegate(document.body);
		this.onType = debounce(this.onType, 150).bind(this);
		this.onFocus = this.onFocus.bind(this);

		// prevent scroll to item
		this.searchEl.addEventListener('keydown', ev => {
			if (ev.which === 40 || ev.which === 38) {
				ev.preventDefault();
			}
		})

		this.searchEl.addEventListener('keyup', ev => {
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

		this.searchEl.addEventListener('focus', this.onFocus);
		this.searchEl.addEventListener('click', this.onFocus);
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

	onFocus (ev) {
		ev.target.setSelectionRange ? ev.target.setSelectionRange(0, ev.target.value.length) : ev.target.select();
		this.show();
	}

	onDownArrow () {
		this.suggestionLinks = Array.from(this.suggestionListContainer.querySelectorAll('a'));
		if (this.suggestionLinks.length) {
			this.suggestionLinks[0].focus();
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
				.then(suggestions => this.suggest(suggestions))
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
