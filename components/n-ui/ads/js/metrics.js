const broadcast = require('n-ui-foundations').broadcast;

module.exports = (timingsObject, slotDetails) => {
	const performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
	if (performance && performance.mark && timingsObject) {
		const offsets = _calculateOffsets(performance, timingsObject);
		const marks = _calculateMarks(performance, timingsObject);

		broadcast('oTracking.event', {
			category: 'ads',
			action: 'first-load',
			timings: { offsets, marks },
			creative: {
				id: slotDetails.gpt.creativeId,
				serviceName: slotDetails.gpt.serviceName,
				size: slotDetails.container.getAttribute('data-o-ads-loaded')
			}

		});
	}
};

const _calculateOffsets = (performance, timings) => {
	const offsets = {};
	Object.keys(timings).forEach((timingName) => {
		offsets[timingName] = {
			domContentLoadedEventEnd: timings[timingName] - performance.timing['domContentLoadedEventEnd'],
			loadEventEnd: timings[timingName] - performance.timing['loadEventEnd'],
			domInteractive: timings[timingName] - performance.timing['domInteractive']
		};
	});
	return offsets;
};

const _calculateMarks = (performance, timings) => {
	const marks = {};
	if (performance.getEntriesByName) {
		Object.keys(timings).forEach((timingName) => {
			performance.getEntriesByName(timingName).forEach((mark) => {
				marks[mark.name] = Math.round(mark.startTime);
			});
		});
	}
	return marks;
};
