/* globals describe, it, beforeEach,expect */
import adsSandbox from '../js/sandbox';

describe('Sandbox', () => {
	beforeEach(() => {
		window.location.hash = '';
	});

	it('Should return true when adsandbox is present in location hash', () => {
		window.location.hash = 'adsandbox';
		expect(adsSandbox.isActive()).to.equal(true);
	});

	it('Should return false when adsandbox is present in location hash', () => {
		expect(adsSandbox.isActive()).to.equal(false);
	});

});
