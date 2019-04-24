import nUIFoundations from 'n-ui-foundations';
import { oAdsUtils } from 'o-ads';

// Probability that a page view is chosen to be send ads-related metrics
const METRICS_SAMPLE_SIZE = 0.1;

export const inMetricsSample = (function () {
	let userSendsMetrics;
	const decideInMetricsSample = function () {

		// We are caching the value since we want to be consistent with the user
		// allocation throughout one same page visit
		if (typeof userSendsMetrics !== 'undefined') {
			return userSendsMetrics;
		}

		userSendsMetrics = (Math.random() < METRICS_SAMPLE_SIZE);
		return userSendsMetrics;

	};
	return decideInMetricsSample;
}());

const metricsDefinitions = [
	{
		spoorAction: 'page-initialised',
		triggers: ['serverScriptLoaded'],
		marks: [
			'initialising',
			'IVTComplete',
			'adsAPIComplete',
			'initialised',
			'serverScriptLoaded',
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

function sendMetrics (eventPayload) {
	if (inMetricsSample()) {
		nUIFoundations.broadcast('oTracking.event', eventPayload);
	}
}

export function setupMetrics () {
	oAdsUtils.setupMetrics(metricsDefinitions, sendMetrics);
}

