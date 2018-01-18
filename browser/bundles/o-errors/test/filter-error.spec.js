const expect = require('chai').expect;

const filterError = require('../filter-error');

describe('filter error', () => {

	it('should not filter Trump error', () => {
		const result = filterError({ error: new Error('Trump') });
		expect(result).to.equal(true);
	});

	[
		'window.FT.ftNextUi is undefined',
		'window.FT.nUi is undefined',
		'window.FT.flags is undefined'
	].map((filterError) => it(`should filter ${filterError}`, () => {
		const result = filterError({ error: new Error(filterError) });
		expect(result).to.equal(false);
	}));

});
