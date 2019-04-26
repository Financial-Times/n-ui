/* globals describe, it, expect, sinon */
import nUIFoundations from 'n-ui-foundations';
import AdsMetrics from '../js/ads-metrics';
import { sendMetrics } from '../js/ads-metrics';

let sandbox;

describe('Ads Metrics', () => {
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('sendMetrics should call broadcast with the right params if user is in metrics sample', () => {
		const inMetricsSampleStub = sandbox.stub().callsFake(() => true);
		AdsMetrics.__Rewire__('inAdsMetricsSample', inMetricsSampleStub);
		const broadcastStub = sandbox.stub(nUIFoundations, 'broadcast');
		const eventPayload = { a: 'aa', b: 'bb' };
		sendMetrics(eventPayload);
		expect(inMetricsSampleStub).to.have.been.called;
		expect(broadcastStub).to.have.been.calledWith('oTracking.event', eventPayload);
		AdsMetrics.__ResetDependency__('inAdsMetricsSample');
	});

	it('Should return the same value for inAdsMetricsSample when called multiple times', () => {
		const firstValue = AdsMetrics.inAdsMetricsSample();

		let count = 0;
		for (let i = 0; i < 100; i++) {
			if (AdsMetrics.inAdsMetricsSample() === firstValue) {
				count++;
			}
		}
		expect(count).to.equal(100);
	});
});
