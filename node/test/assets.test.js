const assets = require ('../lib/assets');
const fetchMock = require('fetch-mock');

describe('assets', () => {
	it.only('should try update n-ui head css from multiple urls', () => {
		fetchMock.spy();
		assets.init().fetchNUiCss()
	});
	it('should cope if all the urls fail', () => {

	});
	// TODO should throw the promise if all the urls fail
})
