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

	it('should record a performance mark for each of the expected events only once', (done) => {
		const eventToPerfmarkMap = {
			foo: 'fooPerfMark',
			bar: 'barPerfMark'
		};

		pageMetrics.recordMarksForEvents(eventToPerfmarkMap);

		document.dispatchEvent(new CustomEvent('oAds.foo'));
		document.dispatchEvent(new CustomEvent('oAds.bar'));
		document.dispatchEvent(new CustomEvent('oAds.bar'));

		setTimeout( () => {
			const mark1 = window.performance.getEntriesByName('fooPerfMark');
			const mark2 = window.performance.getEntriesByName('barPerfMark');
			expect(mark1.length).to.equal(1);
			expect(mark2.length).to.equal(1);
			done();
		}, 0);
	});

	it('should broadcast oTracking.event with the right performance marks', () => {
		const getEntriesByNameStub = sinon.stub();
		getEntriesByNameStub.withArgs('somethingElse').returns([{ name: 'somethingElse', startTime: 400 }]);
		getEntriesByNameStub.withArgs('adsInitialising').returns([{ name: 'adsInitialising', startTime: 500.22 }]);
		getEntriesByNameStub.withArgs('adsIVTComplete').returns([{ name: 'adsIVTComplete', startTime: 600.64 }]);
		getEntriesByNameStub.withArgs('adsTargetingComplete').returns([{ name: 'adsTargetingComplete', startTime: 700.45 }]);
		getEntriesByNameStub.withArgs('adsPreparationComplete').returns([{ name: 'adsPreparationComplete', startTime: 705.57 }]);

		window.performance = {
			getEntriesByName: getEntriesByNameStub
		};

		const expectedTrackingObject = {
			category: 'ads',
			action: 'page-initialised',
			timings: {
				marks: {
					adsInitialising: 500,
					adsIVTComplete: 601,
					adsTargetingComplete: 700,
					adsPreparationComplete: 706
				}
			}
		};

		pageMetrics.setupPageMetrics();
		document.dispatchEvent(new CustomEvent('oAds.adServerLoadSuccess'));
		expect(broadcastStub).to.have.been.calledWith('oTracking.event', expectedTrackingObject);
	});
});

