const OHeader = require('o-header');
const TopicSearch = require('n-topic-search');

function init () {
	new OHeader();

	// initialise separate sticky header
	new OHeader(document.querySelector('[data-o-header--sticky]'));

	const topicSearchElements = document.querySelectorAll('.o-header [data-n-topic-search], .o-header__drawer [data-n-topic-search]');

	if (topicSearchElements.length) {
		for (let i = 0; i < topicSearchElements.length; i++) {
			const form = topicSearchElements[i];
			new TopicSearch(form);
		}
	}
}

module.exports = { init };
