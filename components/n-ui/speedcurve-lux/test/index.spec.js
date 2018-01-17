/* globals sinon, expect */

const speedcurveLux = require('..');

describe('Speedcurve LUX', () => {

	describe('add flags', () => {

		it('should add flags', () => {
			window.LUX = {
				addData: sinon.spy()
			};
			const flags = {
				get: sinon.stub()
			};
			flags.get.withArgs('swAdsCaching').returns('control');

			speedcurveLux.addFlags(flags);

			expect(window.LUX.addData).to.have.been.calledWith('swAdsCaching', 'control');
		});

		it('should add flags after LUX script loads', () => {
			delete window.LUX;
			const querySelector = sinon.stub(document, 'querySelector');
			const addEventListener = sinon.spy();
			querySelector.withArgs('[data-next-speedcurve-lux-script]').returns({ addEventListener });

			speedcurveLux.addFlags();

			// check the script load event is working
			expect(addEventListener).to.have.been.calledWith('load', sinon.match.func);
		});
	});
});
