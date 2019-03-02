/* globals describe, it, beforeEach, afterEach,expect,sinon */
const pageMetrics = require('../js/page-metrics');
const broadcastStub = sinon.stub();
const inMetricsSampleStub = sinon.stub().callsFake(() => true);

// Inject the broadcastStub into sendMetrics with Rewire
// https://github.com/speedskater/babel-plugin-rewire
// set in /build/webpack/loaders/es5.js
pageMetrics.__Rewire__('broadcast', broadcastStub);
pageMetrics.__Rewire__('inMetricsSample', inMetricsSampleStub);

describe('Page Metrics', () => {
	let saveWindowPerformance;

	beforeEach(() => {
		saveWindowPerformance = window.performance;
	});

	afterEach(() => {
		window.performance = saveWindowPerformance;
		broadcastStub.reset();
	});

	it('should call broadcast with correct values', () => {
		const getEntriesByNameStub = sinon.stub();
		getEntriesByNameStub.withArgs('adsInitialising').returns([{ name: 'adsInitialising', startTime: 500 }]);
		getEntriesByNameStub.withArgs('adsIVTComplete').returns([{ name: 'adsIVTComplete', startTime: 600 }]);
		getEntriesByNameStub.withArgs('adsTargetingComplete').returns([{ name: 'adsTargetingComplete', startTime: 700 }]);
		getEntriesByNameStub.withArgs('adsPreparationComplete').returns([{ name: 'adsPreparationComplete', startTime: 705 }]);

		window.performance = {
			getEntriesByName: getEntriesByNameStub
		};

		const expectedTrackingObject = {
			category: 'ads',
			action: 'page-initialised',
			timings: {
				marks: {
					adsInitialising: 500,
					adsIVTComplete: 600,
					adsTargetingComplete: 700,
					adsPreparationComplete: 705
				}
			}
		};

		pageMetrics.setupPageMetrics();
		document.dispatchEvent(new CustomEvent('oAds.adServerLoadSuccess'));
		expect(broadcastStub).to.have.been.calledWith('oTracking.event', expectedTrackingObject);
	});

	it('should call record perfMark for', () => {
		const getEntriesByNameStub = sinon.stub();
		getEntriesByNameStub.withArgs('adsInitialising').returns([{ name: 'adsInitialising', startTime: 500 }]);
		getEntriesByNameStub.withArgs('adsIVTComplete').returns([{ name: 'adsIVTComplete', startTime: 600 }]);
		getEntriesByNameStub.withArgs('adsTargetingComplete').returns([{ name: 'adsTargetingComplete', startTime: 700 }]);
		getEntriesByNameStub.withArgs('adsPreparationComplete').returns([{ name: 'adsPreparationComplete', startTime: 705 }]);

		window.performance = {
			getEntriesByName: getEntriesByNameStub
		};

		const expectedTrackingObject = {
			category: 'ads',
			action: 'page-initialised',
			timings: {
				marks: {
					adsInitialising: 500,
					adsIVTComplete: 600,
					adsTargetingComplete: 700,
					adsPreparationComplete: 705
				}
			}
		};

		pageMetrics.setupPageMetrics();
		document.dispatchEvent(new CustomEvent('oAds.adServerLoadSuccess'));
		expect(broadcastStub).to.have.been.calledWith('oTracking.event', expectedTrackingObject);
	});
});

