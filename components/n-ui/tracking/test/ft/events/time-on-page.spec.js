/*global describe, it, expect, before, after*/
const sinon = require('sinon');
const tracking = require('../../../ft/events/time-on-page');

const oTrackingListener = sinon.stub();

describe('#TimeThresholdEvent', () => {
	let clock;

	before(() => {
		clock = sinon.useFakeTimers();
		document.body.addEventListener('oTracking.event', (e) => {
			oTrackingListener(e.detail);
		});

		tracking.init();
	});

	after(() => {
		clock.restore();
	});

	it('should emit a tracking event after 30s', () => {
		clock.tick(30000);

		expect(oTrackingListener).to.have.been.calledWithMatch({
			action: 'time-threshold',
			category: 'page',
			context: {
				'time-threshold': 30
			}
		});
	});

	it('should emit a tracking event after 60s', () => {
		clock.tick(60000);

		expect(oTrackingListener).to.have.been.calledWithMatch({
			action: 'time-threshold',
			category: 'page',
			context: {
				'time-threshold': 60
			}
		});
	});

	it('should emit a tracking event after 90s', () => {
		clock.tick(90000);

		expect(oTrackingListener).to.have.been.calledWithMatch({
			action: 'time-threshold',
			category: 'page',
			context: {
				'time-threshold': 90
			}
		});
	});
});
