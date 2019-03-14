const inMetricsSample = require('./utils').inMetricsSample;
const nUIFoundations = require('n-ui-foundations');
const { broadcast, perfMark } = nUIFoundations;

const pageEventMarkMap = {
	startInitialisation: 'adsInitialising',
	moatIVTcomplete: 'adsIVTComplete',
	apiRequestsComplete: 'adsTargetingComplete',
	initialised: 'adsPreparationComplete',
	adServerLoadSuccess: 'adsServerLoaded'
};

const kruxEventMarkMap = {
	kruxScriptLoaded: 'kruxScriptLoaded',
	kruxConsentOptinOK: 'kruxConsentOptinOK',
	kruxConsentOptinFailed: 'kruxConsentOptinFailed',
	kruxKuidAck: 'kruxKuidAck',
	kruxKuidError: 'kruxKuidError'
};

const setupPageMetrics = () => {
	sendMetricsOnEvent('oAds.adServerLoadSuccess', sendPageMetrics);
	recordMarksForEvents(pageEventMarkMap);

	sendMetricsOnEvent('oAds.kruxKuidAck', sendKruxMetrics);
	recordMarksForEvents(kruxEventMarkMap);
	sendMetricsOnEvent('oAds.kruxKuidError', sendKruxMetrics);
	recordMarksForEvents(kruxEventMarkMap);

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

const performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;

const getMarksForEventMarkMap = eventMarkMap => {
	let markNames = [];

	for (const key in eventMarkMap) {
		markNames.push(eventMarkMap[key]);
	}

	return getPerfMarks(markNames);
}

const sendPageMetrics = () => {
	if (inMetricsSample()) {
		const marks = getMarksForEventMarkMap(pageEventMarkMap);

		broadcast('oTracking.event', {
			category: 'ads',
			action: 'page-initialised',
			timings: { marks }
		});
	}
};

const sendKruxMetrics = () => {
	if (inMetricsSample()) {
		const marks = getMarksForEventMarkMap(kruxEventMarkMap);

		broadcast('oTracking.event', {
			category: 'ads',
			action: 'krux',
			timings: { marks }
		});
	}
};

const sendMetricsOnEvent = (eventName, callback) => {
	document.addEventListener(eventName, function listenOnInitialised() {
		// We must ensure the 'adsServerLoaded' perfMark has been recorded first
		setTimeout(callback, 0)
		document.removeEventListener(eventName, listenOnInitialised);
	});
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
