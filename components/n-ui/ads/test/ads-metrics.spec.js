/* globals describe, it, expect, sinon */
import nUIFoundations from 'n-ui-foundations';
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
		const broadcastStub = sandbox.stub(nUIFoundations, 'broadcast');
		const eventPayload = { a: 'aa', b: 'bb' };
		sendMetrics(eventPayload);
		expect(broadcastStub).to.have.been.calledWith('oTracking.event', eventPayload);
	});
});
