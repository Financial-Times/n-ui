const React = require('react');

function regExpEscape (s) {
	return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
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
		return this.state.single ? '' : <h3 className="o-header__typeahead-heading">{group.heading}</h3>;
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


	renderItems (group) {

		if (!group.suggestions.length && group.emptyHtml) {
			return group.emptyHtml;
		} else {
			return <ul className="o-header__typeahead-item-list">
				{ group.suggestions.map(suggestion => (
					<li className="o-header__typeahead-item">
						<a className={'o-header__typeahead-link ' + group.linkClassName}
							href={suggestion.url}
							data-trackable="link"
							data-concept-id={suggestion.id}
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
		const hasTags = this.state.suggestions.tags.length && this.state.suggestions.tags.length;
		const hasEquities = this.state.suggestions.equities && this.state.suggestions.equities.length;
		const hasSuggestions = hasTags || hasEquities;
		const suggestions = [];

		if(hasTags) {
			suggestions.push({
				heading: 'News',
				linkClassName: 'o-header__typeahead-link--news',
				trackable: 'news',
				suggestions: this.state.suggestions.tags.slice(0, 6)
					.map(suggestion => ({
						html: this.highlight(suggestion.name),
						url: suggestion.url,
						id: suggestion.id
					})),
				tailLink: {
					url: `/search?q=${this.state.searchTerm}`,
					innerHtml: <span>See all news matching <mark>{this.state.searchTerm}</mark></span>,
					trackable: 'see-all'
				}
			});

		}

		if(hasEquities) {
			suggestions.push({
				heading: 'Equities',
				trackable: 'equities',
				linkClassName: 'o-header__typeahead-link--equities',
				emptyHtml: <div className="o-header__typeahead__no-results-message">No equities found</div>,
				suggestions: this.state.suggestions.equities.slice(0, 6)
					.map(suggestion => ({
						html: `<span class="o-header__typeahead-link__equity-name">${this.highlight(suggestion.name)}</span><abbr>${this.highlight(suggestion.symbol)}</abbr>`,
						url: suggestion.url,
						id: suggestion.symbol
					})),
				tailLink: {
					// React takes care of protecting us from XSS here
					url: `https://markets.ft.com/data/search?query=${this.state.searchTerm}`,
					innerHtml: <span>See all quotes matching <mark>{this.state.searchTerm}</mark></span>,
					trackable: 'see-all'
				}
			});
		}

		return <div className="o-header__typeahead" hidden={ !hasSuggestions} data-trackable="typeahead">
			{ suggestions.map(group => (
				<div className={'o-header__typeahead__group ' + group.className} data-trackable={group.trackable}>
					{this.renderHeading(group)}
					{this.renderItems(group)}
				</div>
			)) }
		</div>
	}
}
