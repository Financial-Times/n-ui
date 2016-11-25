const React = require('react');

export class SuggestionList extends React.Component {
	constructor () {
		super();
		this.state = {suggestions: []}
	}
	render () {
		const hasSuggestions = !this.state.suggestions.length;
		return <ul className="o-header__typeahead" hidden={hasSuggestions}>
	{ this.state.suggestions.map(suggestion => (
			<li className="o-header__typeahead-item">
				<a className="o-header__typeahead-link" href={suggestion.url} data-trackable="typeahead" data-concept-id={suggestion.id} dangerouslySetInnerHTML={{__html:suggestion.name}} ></a>
			</li>
		)) }
	</ul>
	}
};
