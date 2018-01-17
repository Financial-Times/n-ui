const expect = require('chai').expect;

const filterError = require('../filter-error');

describe('filter error', () => {

	it('should not filter Trump error', () => {
		const result = filterError({ error: new Error('Trump') });
		expect(result).to.equal(true);
	});

	it('should filter undefined window.FT.ftNextUi error', () => {
		const result = filterError({ error: new Error('undefined window.FT.ftNextUi') });
		expect(result).to.equal(false);
	});

});
