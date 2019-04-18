// import { inMetricsSample } from'./utils';
import nUIFoundations from 'n-ui-foundations';
import { utils } from 'o-ads';

var eventDefinitions = [
	{
		spoorAction: 'page-initialised',
		triggers: ['adServerLoadSuccess'],
		marks: [
			'startInitialisation',
			'moatIVTcomplete',
			'apiRequestsComplete',
			'initialised',
			'adServerLoadSuccess',
		]
	},
	{
		spoorAction: 'krux',
		triggers: ['kruxKuidAck', 'kruxKuidError', 'kruxConsentOptinFailed'],
		marks: [
			'kruxScriptLoaded',
			'kruxConsentOptinOK',
			'kruxConsentOptinFailed',
			'kruxKuidAck',
			'kruxKuidError',
		]
	},
	{
		spoorAction: 'slot-requested',
		triggers: ['slotGoRender'],
		marks: [
			'slotReady',
			'slotCanRender',
			'slotGoRender',
		],
		multiple: true
	},
	{
		spoorAction: 'slot-rendered',
		triggers: ['slotRenderEnded'],
		marks: [
			'slotRenderStart',
			'slotExpand',
			'slotRenderEnded',
		],
		multiple: true
	}
];

function sendMetrics(eventPayload) {
	if (true) {
		// if (inMetricsSample()) {
		nUIFoundations.broadcast('oTracking.event', eventPayload);
	}
}

function setupMetrics() {
	utils.setupMetrics(eventDefinitions, sendMetrics);
}

export default setupMetrics;

