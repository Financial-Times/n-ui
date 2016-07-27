/*global describe,it,expect*/
import instrumentFetch from '../js/instrument-fetch';
import {restore as restoreFetch} from '../js/instrument-fetch';
import fetchMock from 'fetch-mock';
describe('instrument fetch', () => {

	it('should not enable cors proxy where cors supported', () => {
		const theFetch = window.fetch;
		instrumentFetch({get: () => null});
		expect(window.fetch).to.equal(theFetch);
	})

	it('should enable cors proxy where cors not supported', () => {
		const theXHR = window.XMLHttpRequest;
		window.XMLHttpRequest = function () {
			return {};
		}
		fetchMock
			.mock('/__api-proxy/a-test-url?q=yes', 200);
		const theFetch = window.fetch;
		instrumentFetch({get: () => null});
		expect(window.fetch).not.to.equal(theFetch);

		fetch('https://my.api.com/a-test-url?q=yes', {
			headers: {
				a: 'header'
			},
			useCorsProxy: true
		})
		expect(fetchMock.lastCall()[0]).to.equal('/__api-proxy/a-test-url?q=yes');
		expect(fetchMock.lastCall()[1].headers).to.deep.equal({
			a: 'header',
			'api-host': 'https://my.api.com'
		});
		fetchMock.restore();
		window.XMLHttpRequest = theXHR;
		restoreFetch();
	})


})
