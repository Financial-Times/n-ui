import nUIFoundations from 'n-ui-foundations';
import { utils as oAdsUtils } from 'o-ads';

// Probability that a page view is chosen to be send ads-related metrics
const METRICS_SAMPLE_SIZE = 0.1;

let userSendsMetrics;

const inAdsMetricsSample = function () {
	// We cache the value in order to be consistent with the user
	// allocation throughout a page view
	if (typeof userSendsMetrics !== 'undefined') {
		return userSendsMetrics;
	}

	userSendsMetrics = (Math.random() < METRICS_SAMPLE_SIZE);
	return userSendsMetrics;
};

const metricsDefinitions = [
	{
		spoorAction: 'page-initialised',
		triggers: ['serverScriptLoaded'],
		marks: [
			'consentBehavioral',
			'consentProgrammatic',
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
	if (inAdsMetricsSample()) {
		nUIFoundations.broadcast('oTracking.event', eventPayload);
	}
}

function setupAdsMetrics () {
	oAdsUtils.setupMetrics(metricsDefinitions, sendMetrics);
}


export default {
	inAdsMetricsSample,
	sendMetrics,
	setupAdsMetrics
};
