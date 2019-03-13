const inMetricsSample = require('./utils').inMetricsSample;
const nUIFoundations = require('n-ui-foundations');
const { broadcast, perfMark } = nUIFoundations;

const eventToPerfmarkMap = {
	startInitialisation: 'adsInitialising',
	moatIVTcomplete: 'adsIVTComplete',
	apiRequestsComplete: 'adsTargetingComplete',
	initialised: 'adsPreparationComplete',
	adServerLoadSuccess: 'adsServerLoaded'
};

const setupPageMetrics = () => {
	sendPageMetricsWhenPageReady();
	recordMarksForEvents(eventToPerfmarkMap);
};

const recordPerfMarkForEvent = (eventName, perfMarkName) => {
	const listenerName = 'oAds.' + eventName;
	document.addEventListener(listenerName, function handler() {
		perfMark(perfMarkName);
		document.removeEventListener(listenerName, handler);
	});
};

const recordMarksForEvents = (events2Marks) => {
	for (const eventName in events2Marks) {
		recordPerfMarkForEvent(eventName, events2Marks[eventName]);
	}
};

const sendPageMetricsWhenPageReady = () => {
	document.addEventListener('oAds.adServerLoadSuccess', function listenOnInitialised() {
		// We must ensure the 'adsServerLoaded' perfMark has been recorded first
		setTimeout(sendMetrics, 0)
		document.removeEventListener('oAds.adServerLoadSuccess', listenOnInitialised);
	});
};

const sendMetrics = () => {
	const performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
	let pageMetricsMarkNames = [];

	for (const key in eventToPerfmarkMap) {
		pageMetricsMarkNames.push(eventToPerfmarkMap[key]);
	}

	const marks = getPerfMarks(pageMetricsMarkNames);

	if (inMetricsSample()) {
		broadcast('oTracking.event', {
			category: 'ads',
			action: 'page-initialised',
			timings: { marks }
		});
	}
};

const getPerfMarks = (markNames) => {
	if (!performance || !performance.getEntriesByName) {
		return {};
	}

	const marks = {};
	markNames.forEach(mName => {
		const pMarks = performance.getEntriesByName(mName);
		if (pMarks && pMarks.length) {
			// We don't need sub-millisecond precision
			marks[mName] = Math.round(pMarks[0].startTime);
		};
	});
	return marks;
};

module.exports = {
	setupPageMetrics,
	recordMarksForEvents
};