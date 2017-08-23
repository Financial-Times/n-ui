const React = require('react');
const DISPLAY_ITEMS = 5;

function regExpEscape (s) {
	return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
}

const headingMapping = {
	concepts: 'News',
	equities: 'Securities'
};

const KEYS = {
	ENTER: 13,
	UP_ARROW: 38,
	DOWN_ARROW: 40
};

export class SuggestionList extends React.Component {
	constructor () {
		super();
		this.state = {
			suggestions: {
				concepts: [],
				equities: []
			}
		};
	}

	highlight (text) {
		return text.replace(RegExp(regExpEscape(this.state.searchTerm), 'gi'), '<mark>$&</mark>');
	}

	renderHeading (group) {
		return this.props.categories.length > 1 ? <div className="n-typeahead__heading">{group.heading}</div> : '';
	}

	renderTailLink (group) {
		if (group.tailLink) {
			const linkAttrs = {
				className: 'n-typeahead__link n-typeahead__link--tail',
				href: group.tailLink.url,
				'data-trackable': group.tailLink.trackable
			};

			// eslint-disable-next-line react/no-unknown-property
			return <a {...linkAttrs} ref={(c) => { this.items.push(c); }} tabindex="0">{group.tailLink.innerHtml}</a>;
		}
	}

	handleKeyDown (ev) {
		if (ev.which === KEYS.ENTER) {
			ev.stopPropagation();
			// we don't prevent default as the link's url is a link to the search page
			return;
		}

		if (ev.which === KEYS.DOWN_ARROW) {
			const index = this.items.indexOf(ev.target);
			const newIndex = index + 1;
			if (newIndex < this.items.length) {
				this.items[newIndex].focus();
			} else {
				this.items[0].focus();
			}
			ev.preventDefault(); //disable page scrolling
			return;
		}

		if (ev.which === KEYS.UP_ARROW) {
			const index = this.items.indexOf(ev.target);
			const newIndex = index - 1;
			if (newIndex < 0) {
				this.props.searchEl.focus();
			} else {
				this.items[newIndex].focus();
			}
			ev.preventDefault(); //disable page scrolling
		}
	}

	renderItems (group) {

		if (!group.suggestions.length && group.emptyHtml) {
			return group.emptyHtml;
		} else {
			return <ul className="n-typeahead__item-list">
				{ group.suggestions.map(suggestion => (
					<li className="n-typeahead__item">
						<a className={'n-typeahead__link ' + group.linkClassName}
							ref={(c) => { this.items.push(c); }}
							href={suggestion.url}
							// eslint-disable-next-line react/no-unknown-property
							tabindex="0"
							data-trackable="link"
							data-suggestion-id={suggestion.id}
							data-suggestion-type={suggestion.type}
							dangerouslySetInnerHTML={{__html:suggestion.html}}></a>
					</li>
				)) }
				<li className="n-typeahead__item">
					{this.renderTailLink(group)}
				</li>
			</ul>;
		}
	}

	render () {
		const hasConcepts = this.state.suggestions.concepts && this.state.suggestions.concepts.length;
		const hasEquities = this.state.suggestions.equities && this.state.suggestions.equities.length;
		const hasSuggestions = hasConcepts || hasEquities;
		const suggestions = [];
		this.items = [];
		if (this.props.categories.includes('concepts')) {
			suggestions.push({
				heading: headingMapping['concepts'],
				linkClassName: 'n-typeahead__link--news',
				trackable: 'news',
				suggestions: this.state.suggestions.concepts.slice(0, DISPLAY_ITEMS)
					.map(suggestion => ({
						html: this.highlight(suggestion.prefLabel),
						url: suggestion.url,
						id: suggestion.id,
						type: 'tag'
					})),
				tailLink: this.props.includeViewAllLink && {
					url: `${this.props.searchEl.form.action}?q=${this.state.searchTerm}`,
					innerHtml: <span>See all news matching <mark>{this.state.searchTerm}</mark></span>,
					trackable: 'see-all'
				}
			});

		}

		if (this.props.categories.includes('equities')) {
			suggestions.push({
				heading: headingMapping['equities'],
				trackable: 'equities',
				linkClassName: 'n-typeahead__link--equities',
				emptyHtml: <div className="n-typeahead__no-results-message">No equities found</div>,
				suggestions: this.state.suggestions.equities.slice(0, DISPLAY_ITEMS)
					.map(suggestion => ({
						html: `<span class="n-typeahead__link__equity-name">${this.highlight(suggestion.name)}</span><abbr>${this.highlight(suggestion.symbol)}</abbr>`,
						url: suggestion.url,
						id: suggestion.symbol,
						type: 'equity'
					})),
				tailLink: this.props.includeViewAllLink && {
					// React takes care of protecting us from XSS here
					url: `https://markets.ft.com/data/search?query=${this.state.searchTerm}`,
					innerHtml: <span>See all quotes matching <mark>{this.state.searchTerm}</mark></span>,
					trackable: 'see-all'
				}
			});
		}

		return <div
			className="n-typeahead"
			hidden={ !hasSuggestions }
			data-trackable="typeahead"
			onKeyDown={this.handleKeyDown.bind(this)}>
			{ suggestions.map(group => (
				<div className={'n-typeahead__group ' + group.className} data-trackable={group.trackable}>
					{this.renderHeading(group)}
					{this.renderItems(group)}
				</div>
			)) }
		</div>;
	}
}
