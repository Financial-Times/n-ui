var inMetricsSample = require('./utils').inMetricsSample;
var nUIFoundations = require('n-ui-foundations');
var utils = require('o-ads').utils;

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

function sendMetrics(eventPayload) {
	console.log('eventPayload', eventPayload);
	if (true) {
		// if (inMetricsSample()) {
		nUIFoundations.broadcast('oTracking.event', eventPayload);
	}
}

function setupMetrics() {
	utils.setupMetrics(eventDefinitions, sendMetrics);
}

module.exports.setupMetrics = setupMetrics;

