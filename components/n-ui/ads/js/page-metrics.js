var inMetricsSample = require('./utils').inMetricsSample;
var nUIFoundations = require('n-ui-foundations');

var eventDefinitions = [
	{
		spoorAction: 'page-initialised',
		triggers: ['adServerLoadSuccess'],
		marks: {
			startInitialisation: 'adsInitialising',
			moatIVTcomplete: 'adsIVTComplete',
			apiRequestsComplete: 'adsTargetingComplete',
			initialised: 'adsPreparationComplete',
			adServerLoadSuccess: 'adsServerLoaded'
		}
	},
	{
		spoorAction: 'krux',
		triggers: ['kruxKuidAck', 'kruxKuidError', 'kruxConsentOptinFailed'],
		marks: {
			kruxScriptLoaded: 'kruxScriptLoaded',
			kruxConsentOptinOK: 'kruxConsentOptinOK',
			kruxConsentOptinFailed: 'kruxConsentOptinFailed',
			kruxKuidAck: 'kruxKuidAck',
			kruxKuidError: 'kruxKuidError'
		}
	},
	{
		spoorAction: 'slot-requested',
		triggers: ['gptDisplay'],
		marks: {
			render: 'slotInView',
			gptDisplay: 'slotAdRequested'
		},
		multiple: true
	}
];

function setupMetrics() {
	eventDefinitions.forEach( function(eDef) {
		var triggers = Array.isArray(eDef.triggers) ? eDef.triggers : [];
		triggers.forEach(function(trigger) {
			sendMetricsOnEvent('oAds.' + trigger, eDef);
		});
	});
}

function sendMetricsOnEvent(eventName, eMarkMap) {
	document.addEventListener(eventName, function listenOnInitialised(event) {
		sendMetrics(eMarkMap, event.detail);
		if (!eMarkMap.multiple) {
			document.removeEventListener(eventName, listenOnInitialised);
		}
	});
}

function sendMetrics(eMarkMap, eventDetails) {
	if (true) {
		// if (inMetricsSample()) {

		var suffix = (eventDetails && 'pos' in eventDetails) ? eventDetails.name + '__' + eventDetails.pos + '__' + eventDetails.size : '';
		var marks = getMarksForEventMarkMap(eMarkMap.marks, suffix);
		console.log('-----------------------------------');
		console.log('suffix', suffix);
		console.log('eMarkMap.marks', eMarkMap.marks);
		console.log('performance.getEntriesByType("mark").map.( x => x.name )', performance.getEntriesByType("mark").map( x => x.name ));
		console.log('marks', marks);
		console.log('eventDetails', eventDetails);

		nUIFoundations.broadcast('oTracking.event', {
			category: 'ads',
			action: eMarkMap.spoorAction,
			timings: { marks: marks }
		});
	}
}

function getMarksForEventMarkMap(eventMarkMap, suffix) {
	var markNames = [];

	for (var key in eventMarkMap) {
		markNames.push('oAds.' + key);
		if (suffix) {
			markNames.push('oAds.' + key + '__' + suffix);
		}
	}

	console.log('markNames', markNames);

	return getPerfMarks(markNames);
}

function getPerfMarks(markNames) {
	var performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
	if (!performance || !performance.getEntriesByName) {
		return {};
	}

	var marks = {};
	markNames.forEach(function(mName) {
		var pMarks = performance.getEntriesByName(mName);
		if (pMarks && pMarks.length) {
			// We don't need sub-millisecond precision
			marks[mName] = Math.round(pMarks[0].startTime);
		};
	});
	return marks;
}

module.exports.setupMetrics = setupMetrics;

