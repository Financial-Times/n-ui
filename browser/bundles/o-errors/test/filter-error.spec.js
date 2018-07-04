const expect = require('chai').expect;

const filterError = require('../filter-error');

function buildExceptionObject (errorString, stacktrace = {}) {
	return {
		values: [
			{
				type: 'Error',
				value: errorString,
				stacktrace
			}
		]
	};
}

describe('filter error', () => {

	it('should not filter Trump error', () => {
		const result = filterError({ exception: buildExceptionObject('Trump') });
		expect(result).to.equal(true);
	});

	[
		'window.FT.ftNextUi is undefined',
		'window.FT.nUi is undefined',
		'window.FT.flags is undefined',
		'\'undefined\' is not an object (evaluating \'window.FT.nUi._hiddenComponents\')',
		'undefined is not a function (evaluating \'Object.assign(window.FT.flags',
		'The installing service worker became redundant.',
		'InvalidStateError: InvalidStateError'
	].map(err => it(`should filter ${err}`, () => {
			const result = filterError({ exception: buildExceptionObject(err) });
			expect(result).to.equal(false);
	}));


	it('should filter sourcepoint errors', () => {
		const exception = buildExceptionObject('Some random ref', {
			frames: [
				{ filename: '(/__assets/creatives/ad-blocking/sourcepoint-script-09-05-2018.js' }
			]
		});
		const result = filterError({ exception });
		expect(result).to.equal(false);
	});
});
