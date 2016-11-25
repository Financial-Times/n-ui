const React = require('react');

function regExpEscape (s) {
	return s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
};

export class SuggestionList extends React.Component {
	constructor () {
		super();
		this.state = {
			suggestions: {
				topics: [],
				equities: []
			}
		}
	}

	highlight (text) {
		return text.replace(RegExp(regExpEscape(this.state.searchTerm), 'gi'), '<mark>$&</mark>');
	}

	render () {
		const hasTopics = this.state.suggestions.topics.length;
		const hasEquities = this.state.suggestions.equities.length;
		const hasSuggestions = hasTopics || hasEquities;
		const suggestions = []
		if (hasTopics) {
			suggestions.push({
				heading: 'News',
				suggestions: this.state.suggestions.topics.slice(0,6)
					.map(suggestion => ({
							html: this.highlight(suggestion.name),
							url: suggestion.url,
							id: suggestion.id
					}))
			})
		}

		if (hasEquities) {
			suggestions.push({
				heading: 'Equities',
				suggestions: this.state.suggestions.equities.slice(0,6)
					.map(suggestion => ({
							html: this.highlight(suggestion.name) + `<abbr>${this.highlight(suggestion.symbol)}</abbr>`,
							url: suggestion.url,
							id: suggestion.symbol
					}))
			})
		}

		return <div className="o-header__typeahead" hidden={ !hasSuggestions}>
		{ suggestions.map(group => (
				<div>
					<h3>{group.heading}</h3>
					<ul>
					{ group.suggestions.map(suggestion => (
						<li className="o-header__typeahead-item">
							<a className="o-header__typeahead-link"
								href={suggestion.url}
								data-trackable="typeahead"
								data-concept-id={suggestion.id}
								dangerouslySetInnerHTML={{__html:suggestion.html}} ></a>
						</li>
					)) }
					</ul>
				</div>
			)) }
		</div>
	}
};
