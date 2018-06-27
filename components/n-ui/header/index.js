import OHeader from 'o-header';
import * as promoHandler from './js/promoHandler';
import TopicSearch from 'n-topic-search';

export function init (flags) {
	promoHandler.init(flags);

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
