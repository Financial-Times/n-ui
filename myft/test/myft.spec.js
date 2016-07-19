/* global expect */
import TestComponent from './fixtures/test-component';

describe('myft react stuff', () => {
	it('should be possible to render myft\'s react components', () => {
		expect(() => {
			new TestComponent();
		}).not.to.throw;
	});
});
