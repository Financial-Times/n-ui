var inMetricsSample = require('./utils').inMetricsSample;
var nUIFoundations = require('n-ui-foundations');
var oAds = require('o-ads');

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
			ready: 'slotReady',
			render: 'slotInView',
			gptDisplay: 'slotAdRequested'
		},
		multiple: true
	},
	{
		spoorAction: 'slot-rendered',
		triggers: ['adIframeLoaded'],
		marks: {
			rendered: 'slotR1',
			complete: 'slotComplete',
			adIframeLoaded: 'slotRendered'
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

		var suffix = (eventDetails && 'pos' in eventDetails) ? '__' + eventDetails.pos + '__' + eventDetails.size : '';
		var marks = getMarksForEventMarkMap(eMarkMap.marks, suffix);

		var eventPayload = {
			category: 'ads',
			action: eMarkMap.spoorAction,
			timings: { marks: marks }
		};

		if (eventDetails && 'pos' in eventDetails) {
			eventPayload.creative = {
				ad_pos: eventDetails.pos,
				ad_size: eventDetails.size && eventDetails.size.toString()
			};
		}

		nUIFoundations.broadcast('oTracking.event', eventPayload);
	}
}

function getMarksForEventMarkMap(eventMarkMap, suffix) {
	var markNames = [];
	var eventName;

	for (var key in eventMarkMap) {
		eventName = 'oAds.' + key + suffix;
		markNames.push(eventName);
	}

	return getPerfMarks(markNames, suffix);
}

function getPerfMarks(markNames, suffix) {
	var performance = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
	if (!performance || !performance.getEntriesByName) {
		return {};
	}

	var marks = {};
	markNames.forEach(function(mName) {
		var pMarks = performance.getEntriesByName(mName);
		var markName = mName.replace('oAds.', '').replace(suffix, '');
		if (pMarks && pMarks.length) {
			// We don't need sub-millisecond precision
			marks[markName] = Math.round(pMarks[0].startTime);
		};
	});
	return marks;
}

module.exports.setupMetrics = setupMetrics;

