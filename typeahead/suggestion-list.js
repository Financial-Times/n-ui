const React = require('react');

function regExpEscape (s) {
	return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
}

const headingMapping = {
	tags: 'News',
	equities: 'Equities'
}

const KEYS = {
	ENTER: 13,
	UP_ARROW: 38,
	DOWN_ARROW: 40
}

export class SuggestionList extends React.Component {
	constructor () {
		super();
		this.state = {
			suggestions: {
				tags: [],
				equities: []
			}
		}
	}

	highlight (text) {
		return text.replace(RegExp(regExpEscape(this.state.searchTerm), 'gi'), '<mark>$&</mark>');
	}

	renderHeading (group) {
		return this.props.categories.length > 1 ? <h3 className="o-header__typeahead-heading">{group.heading}</h3> : '';
	}

	renderTailLink (group) {
		if (group.tailLink) {
			const linkAttrs = {
				className: 'o-header__typeahead-link o-header__typeahead-link--tail',
				href: group.tailLink.url,
				'data-trackable': group.tailLink.trackable
			};

			return <a {...linkAttrs} >{group.tailLink.innerHtml}</a>
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
			return <ul className="o-header__typeahead-item-list">
				{ group.suggestions.map(suggestion => (
					<li className="o-header__typeahead-item">
						<a className={'o-header__typeahead-link ' + group.linkClassName}
							ref={(c) => { this.items.push(c) }}
							href={suggestion.url}
							data-trackable="link"
							data-suggestion-id={suggestion.id}
							data-suggestion-type={suggestion.type}
							dangerouslySetInnerHTML={{__html:suggestion.html}}></a>
					</li>
				)) }
				<li className="o-header__typeahead-item">
					{this.renderTailLink(group)}
				</li>
			</ul>
		}
	}

	render () {
		const hasTags = this.state.suggestions.tags && this.state.suggestions.tags.length;
		const hasEquities = this.state.suggestions.equities && this.state.suggestions.equities.length;
		const hasSuggestions = hasTags || hasEquities;
		const suggestions = [];
		this.items = [];
		if (this.props.categories.includes('tags') && hasTags) {
			suggestions.push({
				heading: headingMapping['tags'],
				linkClassName: 'o-header__typeahead-link--news',
				trackable: 'news',
				suggestions: this.state.suggestions.tags.slice(0, 6)
					.map(suggestion => ({
						html: this.highlight(suggestion.name),
						url: suggestion.url,
						id: suggestion.id,
						type: 'tag'
					})),
				tailLink: this.props.includeViewAllLink && {
					url: `/search?q=${this.state.searchTerm}`,
					innerHtml: <span>See all news matching <mark>{this.state.searchTerm}</mark></span>,
					trackable: 'see-all'
				}
			});

		}

		if (this.props.categories.includes('equities') && hasEquities) {
			suggestions.push({
				heading: headingMapping['equities'],
				trackable: 'equities',
				linkClassName: 'o-header__typeahead-link--equities',
				emptyHtml: <div className="o-header__typeahead__no-results-message">No equities found</div>,
				suggestions: this.state.suggestions.equities.slice(0, 6)
					.map(suggestion => ({
						html: `<span class="o-header__typeahead-link__equity-name">${this.highlight(suggestion.name)}</span><abbr>${this.highlight(suggestion.symbol)}</abbr>`,
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
			className="o-header__typeahead"
			hidden={ !hasSuggestions }
			data-trackable="typeahead"
			onKeyDown={this.handleKeyDown.bind(this)}>
			{ suggestions.map(group => (
				<div className={'o-header__typeahead__group ' + group.className} data-trackable={group.trackable}>
					{this.renderHeading(group)}
					{this.renderItems(group)}
				</div>
			)) }
		</div>
	}
}
