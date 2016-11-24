const React = require('react');

export class SuggestionList extends React.Component {
	render () {
		const suggestions = this.state.suggestions || [];
		const hasSuggestions = !suggestions.length;
		return <ul class="o-header__typeahead" hidden={hasSuggestions}>
  { suggestions.map(suggestion => (
			<li class="o-header__typeahead-item">
				<a class="o-header__typeahead-link" href={suggestion.url} data-trackable="typeahead" data-concept-id={suggestion.id} dangerouslySetInnerHTML={{__html:suggestion.name}} ></a>
			</li>
		)) }
  </ul>
	}
};
