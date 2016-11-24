/*global fetch*/
const Delegate = require('ftdomdelegate');
const debounce = require('../../utils').debounce;

function getNonMatcher(container) {
	if (typeof container === 'string') {
		return function (el) {
			return el && el !== document && !el.matches(container);
		};
	}

	return function (el) {
		return el && el !== document && el !== container;
	};
}

function isOutside(el, container) {
	const doesntMatch = getNonMatcher(container);

	while (doesntMatch(el)) {
		el = el.parentNode;
	}

	return !el || el === document;
}

function regExpEscape (s) {
	return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
};


function Suggestion(data) {
	var o = Array.isArray(data)
	  ? { label: data[0], value: data[1] }
	  : typeof data === "object" && "label" in data && "value" in data ? data : { label: data, value: data };

	this.label = o.label || o.value;
	this.value = o.value;
}
Object.defineProperty(Suggestion.prototype = Object.create(String.prototype), "length", {
	get: function() { return this.label.length; }
});
Suggestion.prototype.toString = Suggestion.prototype.valueOf = function () {
	return "" + this.label;
};

class Typeahead {
	constructor(containerEl, input, dataSrc, showAllHandler) {
		this.container = containerEl;
		this.searchEl = input;
		this.submitButton = this.container.querySelector('button[type="submit"]')
		this.showAllHandler = showAllHandler;
		this.dataSrc = dataSrc;
		this.minLength = 2;
		this.showAllItem = false;
		this.init();
	}

	init() {
		this.suggestions = [];
		this.suggestionList = document.createElement('ul');
		this.suggestionList.classList.add('o-header__typeahead');
		this.container.insertBefore(this.suggestionList, this.submitButton);

		if (this.showAllItem) {
			this.viewAllItem = document.createElement('li');
			this.viewAllItem.classList.add('o-header__typeahead-view-all');
			this.viewAllItemInnerHTML = '<button type="submit" data-trackable="view-all">View All Results</button>';
		}

		this.delegate = new Delegate(this.container);
		this.bodyDelegate = new Delegate(document.body);
		this.suggest = this.suggest.bind(this);
		this.onType = debounce(this.onType, 150).bind(this);
		this.onDownArrow = this.onDownArrow.bind(this);
		this.onSuggestionKey = this.onSuggestionKey.bind(this);
		this.onSuggestionClick = this.onSuggestionClick.bind(this);

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
			this.reshow();
		});


		this.delegate.on('click', 'input[type="text"]', (ev) => {
			ev.target.setSelectionRange ? ev.target.setSelectionRange(0, ev.target.value.length) : ev.target.select();
			this.reshow();
		});

		this.delegate.on('keyup', '.o-header__typeahead a, .o-header__typeahead button[type="submit"]', this.onSuggestionKey);
		this.delegate.on('click', '.o-header__typeahead a', this.onSuggestionClick);
		// prevent scroll to item
		this.delegate.on('keydown', 'input, .o-header__typeahead a', ev => {
			if (ev.which === 40 || ev.which === 38) {
				ev.preventDefault();
			}
		})
	}

	// EVENT HANDLERS
	reshow() {
		this.suggest(this.suggestions);
	}

	onType() {
		this.searchTerm = this.searchEl.value.trim();
		this.getSuggestions(this.searchTerm);
		[].forEach.call(this.suggestionList.querySelectorAll('li'), function (el) {
			el.setAttribute('data-trackable-meta', '{"search-term":"' + this.searchTerm + '"}');
		}.bind(this));
	}

	onDownArrow(ev) {
		if (this.suggestions.length) {
			this.suggestionList.querySelector('a').focus();
		}
	}

	onSuggestionClick(ev) {
		this.chooseSuggestion(ev.target);
		// we don't prevent default as the link's url is a link to the search page
	}

	onSuggestionKey(ev) {
		if (ev.which === 13) { // Enter pressed
			this.chooseSuggestion(ev.target);
			ev.stopPropagation();
			// we don't prevent default as the link's url is a link to the search page
			return;
		}

		if (ev.which === 40) { // down arrow pressed
			const oLi = ev.target.parentNode.nextElementSibling;
			if (oLi) {
				oLi.firstElementChild.focus();
			}
			return;
		}

		if (ev.which === 38) { // up arrow pressed
			const previousLi = ev.target.parentNode.previousElementSibling;
			if (previousLi) {
				previousLi.firstElementChild.focus();
			} else {
				this.searchEl.focus();
			}
			return;
		}
	}

	// INTERNALS
	getSuggestions(value) {
		value = value.trim();
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
	highlight (text) {
		return text.replace(RegExp(regExpEscape(this.searchTerm), "gi"), "<mark>$&</mark>");
	}

	suggest(suggestions) {
		this.suggestionList.innerHTML = '';
		this.suggestions = suggestions;
		if (this.suggestions.length) {
			this.suggestions.slice(0, 6).forEach((suggestion) => {
				if (suggestion) {
					const text = this.highlight(suggestion.name)
					const url = suggestion.url || ('/stream/' + suggestion.taxonomy + 'Id/' + suggestion.id);
					this.suggestionList.insertAdjacentHTML('beforeend', `<li class="o-header__typeahead-item">
						<a class="o-header__typeahead-link" href="${url}" data-trackable="typeahead" data-concept-id="${suggestion.id}"
						data-trackable-meta="{&quot;search-term&quot;:&quot;${this.searchTerm}&quot;}">${text}</a>
					</li>`);
				}
			});

			if (this.viewAllItem) {
				this.suggestionList.appendChild(this.viewAllItem);
				this.viewAllItem.innerHTML = this.viewAllItemInnerHTML; // IE hack
				this.viewAllItem.children[0].addEventListener('click', this.showAllHandler);
			}

			this.show();
		} else {
			this.hide();
		}
	}

	unsuggest() {
		this.hide();
	}

	hide() {
		this.suggestionList.setAttribute('hidden', '');
		this.bodyDelegate.off();
	}

	show() {
		this.suggestionList.removeAttribute('hidden');
		['focus', 'touchstart', 'mousedown']
			.forEach(type => {
				this.bodyDelegate.on(type, (ev) => {
					if (isOutside(ev.target, this.container)) {
						this.hide();
					}
				});
			})
	}

	chooseSuggestion(suggestionEl) {
		this.searchEl.value = suggestionEl.textContent;
		this.hide();
		this.searchEl.focus();
	}
}

export default Typeahead;
