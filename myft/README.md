# n-ui myft/[![Circle CI](https://circleci.com/gh/Financial-Times/n-ui/myft/tree/master.svg?style=svg)](https://circleci.com/gh/Financial-Times/n-ui/myft/tree/master)

Client-side module to handle display of generic myft ui e.g. add to myft buttons

## Consuming

* Include JS and SCSS
* Templates are provided for the following:

### Following

	{{>n-ui/myft/templates/follow}}
	{{>n-ui/myft/templates/unfollow}}

The templates require a _conceptId_ variable. You can also override the button text by providing a _buttonText_ property.

You can require different versions of the button as below:
	{{>n-ui/myft/templates/follow version='3'}}

You can require different variants of the button as below:
	{{>n-ui/myft/templates/follow variant='standout'}}
	{{>n-ui/myft/templates/follow variant='inverse'}}

You can require different sizes of the button as below:
	{{>n-ui/myft/templates/follow size="big" variant='standout'}}

### Save for later

	{{>n-ui/myft/templates/save-for-later contentId=id}}
	{{>n-ui/myft/templates/unsave-for-later contentId=id}}

The templates require an _contentId_ variable. You can also override the button text by providing a _buttonText_ property.

### Prefer

	{{>n-ui/myft/templates/prefer preferenceName="email-digest" buttonText="Subscribe"}}
	{{>n-ui/myft/templates/unprefer preferenceName="email-digest" buttonText="Subscribe"}}

The templates require a _preferenceName_ variable and a _buttonText_ property.
IN addition you may define a label, either as text, using _label_, or by specifying the name of a partial to render, using _lableTemplate_

## JS API

- `init()` Sets up listeners to update all myft buttons (follow, save, preference) to match the user's preferences
- 'updateUi(el)' Update the ui within a given element to match the user's preferences. If `el` is undefined applies to the whole page

To detect changes to myft buttons states listen for the `nButtons.stateChange` event

- `TopicSearch(opts)`
Constructor for a widget that searches for topics. Available options :=

	* `searchEl` - the text input used to search for topics
	* `destinationEl` - element in which to output results. Can contain default content to display when searhc in put is empty
	* `resultsMessage` - message to show confirming that a search is being conducted (default 'Results:')
	* `resultsMessageEl` element in which to output results message. Can contain default content to display when searhc in put is empty
	* `resultTpl` - template for rendering a single result. Will carry out the following substitutions
		* '%7BconceptId%7D' -> uriEncoded concept id
		* '{conceptId}' -> concept id
		* '{name}' -> topic name
		* '{url}' -> topic stream url
		* '{taxonomy}' -> topic taxonomy
		* '{searchTerm}' -> current value of the search input
	* `noResultsTpl` - template for rendering a message to say no results were found
		* '{searchTerm}' -> current value of the search input
	* `minSearchTermLength` - min length of search term before search is triggered (default 2)
	* `maxResults` - maximum number of results to return (default 5)
	* `excludeSpecial` - exclude ['special' topics](https://github.com/Financial-Times/next-mustang/blob/master/server/models/special-pages.js) from the results (default true)
	* `include` - comma separated list of topic taxonomies to include (will exclude all others)
	* `exclude` - comma separated list of topic taxonomies to exclude (will include all others. If set `excludeSpecial` is ignored)

	When results have been fetched and rendered the 'myft.ui.topicSearch.updated' event is fired on `destinationEl`


## Releasing

This is a bower module, to release update the git tag.

Communicates with
[next-user-preferences-api](http://github.com/Financial-Times/next-user-preferences-api)
to store preferences Details are stored against users' eRightsID.

Also contains client side polling of User Notifications.

## Testing

Run `make test` to run Karma/Mocha tests.
