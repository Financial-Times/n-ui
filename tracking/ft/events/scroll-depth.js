const broadcast = require('../../../utils').broadcast;
const throttle = require('lodash/function/throttle');

let mockedWindowHeight;
// these are what scroll depth are bucketed into
const percentageBuckets = [25, 50, 75, 100];

function getPercentageViewable(elementQuerySelector) {
	const scrollableElement = document.querySelector(elementQuerySelector);
	const windowHeight = mockedWindowHeight || window.innerHeight;
	return (100 / scrollableElement.getBoundingClientRect().height) * (windowHeight - scrollableElement.getBoundingClientRect().top);
}
function fireBeacon(percentage, contextSource) {
	// need to also send all 'smaller' percentages
	const currentBuckets = percentageBuckets.filter(function (bucket) {
		return bucket <= percentage;
	});
	currentBuckets.forEach(function (currentBucket) {
		if (scrollDepth.percentagesViewed.indexOf(currentBucket) === -1) {
			const data = {
				action: 'scrolldepth',
				category: 'page',
				meta: {
					percentagesViewed: currentBucket
				},
				context: {
					product: 'next',
					source: contextSource
				}
			};
			broadcast('oTracking.event', data);
			scrollDepth.percentagesViewed.push(currentBucket);
		}
	});
}

const scrollDepth = {
	// keep a log so we don't send the same percentage multiple times
	percentagesViewed: [],

	init: function (elementQuerySelector, contextSource, opts) {

		if (!(contextSource && contextSource.length)) {
			throw new Error('contextSource required');
		}

		if (!(elementQuerySelector && elementQuerySelector.length)) {
			throw new Error('elementQuerySelector required');
		}

		opts = opts || {};
		// allow mocking of window height
		mockedWindowHeight = opts.windowHeight;
		if (document.querySelector(elementQuerySelector)) {
			// how much of the scrollable element can we initially see
			fireBeacon(getPercentageViewable(elementQuerySelector));
			// throttle scrolling
			window.addEventListener('scroll', throttle(function () {
				fireBeacon(getPercentageViewable(elementQuerySelector), contextSource);
			}, opts.delay !== undefined ? opts.delay : 250));
		}
	}
};

module.exports = scrollDepth;
