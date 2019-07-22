import nUIFoundations from 'n-ui-foundations';
import { utils as oAdsUtils } from 'o-ads';

// Probability that a page view is chosen to be send ads-related metrics
const METRICS_SAMPLE_SIZE = 0.1;

const metricsDefinitions = [
	{
		sampleSize: METRICS_SAMPLE_SIZE,
		spoorAction: 'page-initialised',
		triggers: ['serverScriptLoaded'],
		marks: [
			'consentBehavioral',
			'consentProgrammatic',
			'moatTimeout',
			'initialising',
			'IVTComplete',
			'adsAPIComplete',
			'initialised',
			'serverScriptLoaded',
		],
		navigation: ['domInteractive']
	},
	{
		sampleSize: METRICS_SAMPLE_SIZE,
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
		sampleSize: METRICS_SAMPLE_SIZE,
		spoorAction: 'slot-rendered',
		triggers: ['slotRenderEnded'],
		marks: [
			'slotRenderStart',
			'slotExpand',
			'slotRenderEnded'
		],
		multiple: true
	},
	{
		sampleSize: METRICS_SAMPLE_SIZE,
		spoorAction: 'slot-collapsed',
		triggers: ['slotCollapsed'],
		marks: [ 'slotCollapsed' ],
		multiple: true
	}
];

function sendMetrics (eventPayload) {
	nUIFoundations.broadcast('oTracking.event', eventPayload);
}

function setupAdsMetrics (disableSampling) {
	oAdsUtils.setupMetrics(metricsDefinitions, sendMetrics, disableSampling);
}


export default {
	sendMetrics,
	setupAdsMetrics
};
