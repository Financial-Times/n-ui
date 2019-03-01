const inMetricsSample = require('./utils').inMetricsSample;
const nUIFoundations = require('n-ui-foundations');
const { broadcast, perfMark } = nUIFoundations;

const setupPageMetrics = () => {
	sendPageMetricsWhenInitialised();
	mapEventsToPerfMarks();
};

const recordPerfMarkForEvent = (eventName) => {
	const listenerName = 'oAds.' + eventName;
	console.log('adding + ', listenerName);
	document.addEventListener(listenerName, function handler() {
		perfMark(eventToPerfmarkMap[eventName]);
		console.log('removing + ', listenerName);
		document.removeEventListener(listenerName, handler);
	});
};

const mapEventsToPerfMarks = () => {
	for (const eventName in eventToPerfmarkMap) {
		recordPerfMarkForEvent(eventName);
	}
};

const eventToPerfmarkMap = {
	startInitialisation: 'adsInitialising',
	moatIVTcomplete: 'adsIVTComplete',
	apiRequestsComplete: 'adsTargetingComplete',
	initialised: 'adsPreparationComplete'
};

const sendPageMetricsWhenInitialised = () => {
	document.addEventListener('oAds.adServerLoadSuccess', function listenOnInitialised() {
		sendMetrics();
		document.addEventListener('oAds.adServerLoadSuccess', listenOnInitialised);
	});
};

const sendMetrics = () => {
	const performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
	const marks = getPagePerfMarks(Object.values(eventToPerfmarkMap));

	if (inMetricsSample()) {
		broadcast('oTracking.event', {
			category: 'ads',
			action: 'pageInitialised',
			timings: { marks }
		});
	}
};

const getPagePerfMarks = (markNames) => {
	if (!performance || !performance.getEntriesByName) {
		return {};
	}

	const marks = {};
	markNames.forEach(mName => {
		const pMarks = performance.getEntriesByName(mName);
		if (pMarks && pMarks.length) {
			marks[mName] = pMarks[0].startTime;
		};
	});
	return marks;
};

module.exports = { setupPageMetrics };
