const assets = require ('../lib/assets');
const nUiManager = require ('../lib/n-ui-manager');
const fetchMock = require('fetch-mock');
const expect = require('chai').expect
nUiManager.init(__dirname + '/fixtures/app');
const initAssets = () => assets.init({withHeadCss: true}, __dirname + '/fixtures/app', str => `hashed/${str}`)

describe('assets lib', () => {
	it('should try update n-ui head css from multiple urls', () => {
		fetchMock.spy();
		return initAssets().fetchNUiCss()
			.then(() => {
				expect(fetchMock.calls().unmatched[0][0]).to.equal('https://www.ft.com/__assets/n-ui/cached/v1.1.1/head-n-ui-core.css')
				expect(fetchMock.calls().unmatched[1][0]).to.equal('http://ft-next-n-ui-prod.s3-website-eu-west-1.amazonaws.com/__assets/n-ui/cached/v1.1.1/head-n-ui-core.css')
				expect(fetchMock.calls().unmatched[2][0]).to.equal('http://ft-next-n-ui-prod-us.s3-website-us-east-1.amazonaws.com/__assets/n-ui/cached/v1.1.1/head-n-ui-core.css')
				fetchMock.restore();
			})

	});

	it('should retry if a url fails', () => {
		let count = 0;
		fetchMock.mock('https://www.ft.com/__assets/n-ui/cached/v1.1.1/head-n-ui-core.css', () => {
			// count++;
			return (++count === 3) ? 'fake css' : 503;
		})
			.catch(503);

		return initAssets().fetchNUiCss()
			.then(() => {
				expect(fetchMock.calls('https://www.ft.com/__assets/n-ui/cached/v1.1.1/head-n-ui-core.css').length).to.equal(3)
				fetchMock.restore();
			})

	});

	it('should write value to headCss used by page', () => {
		fetchMock.mock('https://www.ft.com/__assets/n-ui/cached/v1.1.1/head-n-ui-core.css', 'head-n-ui-core-new')
			.catch(503);

		return initAssets().fetchNUiCss()
			.then(stylesheets => {
				expect(stylesheets['head-n-ui-core']).to.equal('head-n-ui-core-new')
				fetchMock.restore();
			})
	})

	it('should just use local file if all requests fail', () => {

		fetchMock.mock('*', 503)

		return initAssets().fetchNUiCss()
			.then(stylesheets => {
				expect(stylesheets['head-n-ui-core']).to.match(/head-n-ui-core\.css/)
				fetchMock.restore();
			})
	});


	// TODO should throw the promise if all the urls fail
})
