const React = require('react');

export class SuggestionList extends React.Component {
	render () {
		const suggestions = this.state.suggestions || [];
		const hasSuggestions = !suggestions.length;
		return <ul className="o-header__typeahead" hidden={hasSuggestions}>
	{ suggestions.map(suggestion => (
			<li className="o-header__typeahead-item">
				<a className="o-header__typeahead-link" href={suggestion.url} data-trackable="typeahead" data-concept-id={suggestion.id} dangerouslySetInnerHTML={{__html:suggestion.name}} ></a>
			</li>
		)) }
	</ul>
	}
};
