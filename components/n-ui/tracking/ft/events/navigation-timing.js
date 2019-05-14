const broadcast = require('n-ui-foundations').broadcast;

// ordered performance timing events that are fired
const timingEvents = [
	'navigationStart',
	'unloadEventStart',
	'unloadEventEnd',
	'redirectStart',
	'redirectEnd',
	'fetchStart',
	'domainLookupStart',
	'domainLookupEnd',
	'connectStart',
	'connectEnd',
	'secureConnectionStart',
	'requestStart',
	'responseStart',
	'responseEnd',
	'domLoading',
	'domInteractive',
	'domContentLoadedEventStart',
	'domContentLoadedEventEnd',
	'domComplete',
	'loadEventStart',
	'loadEventEnd'
];

const getOffsets = performance => {
	const timing = performance.timing;
	return ['navigationStart', 'domLoading']
		.reduce((offsets, offsetEvent) => {
			const offsetTime = timing[offsetEvent];
			offsets[offsetEvent] = timingEvents.slice(timingEvents.indexOf(offsetEvent) + 1)
				.reduce((events, event) => {
					const eventTime = timing[event];
					if (eventTime) {
						events[event] = eventTime - offsetTime;
					}
					return events;
				}, {});
			return offsets;
		}, {});
};

const getMarks = performance =>
	performance.getEntriesByType ?
		performance.getEntriesByType('mark')
			.reduce((marks, mark) => {
				marks[mark.name] = Math.round(mark.startTime);
				return marks;
			}, {}) :
		{};

const getCustom = (window, performance) => {
	const custom = {};
	// first paint metric, cribbed from https://github.com/addyosmani/timing.js/blob/master/timing.js
	const chromeObj = window.chrome;
	if (chromeObj && chromeObj.loadTimes) {
		const chromeLoadTimes = chromeObj.loadTimes();
		custom.firstPaint = Math.round((chromeLoadTimes.firstPaintTime * 1000) - (chromeLoadTimes.startLoadTime * 1000));
	} else if (typeof performance.timing.msFirstPaint === 'number') {
		custom.firstPaint = performance.timing.msFirstPaint - performance.timing.navigationStart;
	}

	return custom;
};

const NavigationTiming = function () { };

NavigationTiming.prototype.track = function () {
	window.addEventListener('load', () => {
		const performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;
		if (!performance || !('timing' in performance) || !/spoor-id=0/.test(document.cookie)) {
			return false;
		}

		setTimeout(() => {
			const offsets = getOffsets(performance);
			const marks = getMarks(performance);
			const custom = getCustom(window, performance);

			broadcast('oTracking.event', {
				category: 'page-load',
				action: 'timing',
				timings: { offsets, marks, custom }
			});
		}, 0);
	});
};

module.exports = NavigationTiming;
