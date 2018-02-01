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
		'window.FT.flags is undefined',
		'undefined is not an object (evaluating \'window.FT.nUi._hiddenComponents\')',
		'undefined is not a function (evaluating \'Object.assign(window.FT.flags'
	].map(err => it(`should filter ${err}`, () => {
			const result = filterError({ error: new Error(err) });
			expect(result).to.equal(false);
	}));

});
