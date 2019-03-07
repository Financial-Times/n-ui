/* globals describe, it, beforeEach, afterEach,expect,sinon */
const pageMetrics = require('../js/page-metrics');
const broadcastStub = sinon.stub();

// In reality, we are sampling the number of users that send metrics
// to Spoor which, without this stub, would lead to flaky tests
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

	it('should broadcast oTracking.event with the right performance marks', (done) => {
		const getEntriesByNameStub = sinon.stub();
		getEntriesByNameStub.withArgs('somethingElse').returns([{ name: 'somethingElse', startTime: 400 }]);
		getEntriesByNameStub.withArgs('adsInitialising').returns([{ name: 'adsInitialising', startTime: 500.22 }]);
		getEntriesByNameStub.withArgs('adsIVTComplete').returns([{ name: 'adsIVTComplete', startTime: 600.64 }]);
		getEntriesByNameStub.withArgs('adsTargetingComplete').returns([{ name: 'adsTargetingComplete', startTime: 700.45 }]);
		getEntriesByNameStub.withArgs('adsPreparationComplete').returns([{ name: 'adsPreparationComplete', startTime: 705.57 }]);
		getEntriesByNameStub.withArgs('adsServerLoaded').returns([{ name: 'adsServerLoaded', startTime: 905.57 }]);

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
					adsPreparationComplete: 706,
					adsServerLoaded: 906
				}
			}
		};

		pageMetrics.setupPageMetrics();
		document.dispatchEvent(new CustomEvent('oAds.adServerLoadSuccess'));
		setTimeout( () => {
			expect(broadcastStub).to.have.been.calledWith('oTracking.event', expectedTrackingObject);
			done();
		});
	});

	it('captures all the expected page metrics', (done) => {
		pageMetrics.setupPageMetrics();
		document.dispatchEvent(new CustomEvent('oAds.startInitialisation'));
		document.dispatchEvent(new CustomEvent('oAds.apiRequestsComplete'));
		document.dispatchEvent(new CustomEvent('oAds.moatIVTcomplete'));
		document.dispatchEvent(new CustomEvent('oAds.initialised'));
		document.dispatchEvent(new CustomEvent('oAds.adServerLoadSuccess'));

		setTimeout( () => {
			expect(broadcastStub).to.have.been.called;
			const marksObject = broadcastStub.firstCall.args[1].timings.marks;
			expect(marksObject.adsInitialising).to.be.a('number');
			expect(marksObject.adsIVTComplete).to.be.a('number');
			expect(marksObject.adsTargetingComplete).to.be.a('number');
			expect(marksObject.adsPreparationComplete).to.be.a('number');
			expect(marksObject.adsServerLoaded).to.be.a('number');
			done();
		});
		// expect(broadcastStub).to.have.been.calledWith('oTracking.event');
	});
});

