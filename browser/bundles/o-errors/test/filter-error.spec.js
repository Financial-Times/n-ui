const expect = require('chai').expect;

const filterError = require('../filter-error');

function buildExceptionObject (errorString) {
	return {
		values: [
			{
				stacktrace: null,
				type: 'Error',
				value: errorString
			}
		]
	};
}

describe('filter error', () => {

	it('should not filter Trump error', () => {
		const result = filterError({ exception: new Error('Trump') });
		expect(result).to.equal(true);
	});

	[
		'window.FT.ftNextUi is undefined',
		'window.FT.nUi is undefined',
		'window.FT.flags is undefined',
		'undefined is not an object (evaluating \'window.FT.nUi._hiddenComponents\')',
		'undefined is not a function (evaluating \'Object.assign(window.FT.flags'
	].map(err => it(`should filter ${err}`, () => {
			const result = filterError({ exception: buildExceptionObject(err) });
			expect(result).to.equal(false);
	}));

});
