/* globals sinon, expect */

const speedcurveLux = require('..');

describe('Speedcurve LUX', () => {

	describe('add flags', () => {

		it('should add flags', () => {
			window.LUX = {
				addData: sinon.spy()
			};
			document.documentElement.setAttribute('data-ab-state', 'headlineTesting:variant2,swAdsCaching:control,onsiteMessagingTest:on');

			speedcurveLux.addFlags();

			expect(window.LUX.addData).to.have.been.calledWith('headlineTesting', 'variant2');
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
