/*global describe, it, expect*/
const Timing = require('../../../ft/events/navigation-timing');

// Simulate a click on a given DOM element
const load = function () {
	return window.dispatchEvent(new Event('load', { 'view': window, 'bubbles': true, 'cancelable': true }));
};

describe('Navigation timing', function () {

	it('should exist', function () {
		expect(Timing).to.exist;
	});

	it('should record the window.performance.timing data', function (done) {
		document.body.addEventListener('oTracking.event', function listener (e) {
			expect(e.detail.timings).to.exist;
			expect(e.detail.timings.offsets.navigationStart.loadEventStart).to.be.a('number');
			expect(e.detail.timings.offsets.domLoading.domInteractive).to.be.a('number');
			expect(e.detail.timings.marks.test).to.be.a('number');
			document.body.removeEventListener('oTracking.event', listener);
			done();
		});
		new Timing().track();
		// add a mark
		window.performance.mark('test');
		document.cookie = 'spoor-id=01234';
		load();  // simulate the window.load event
	});

});
