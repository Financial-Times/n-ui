/* globals describe, it, beforeEach, afterEach,expect,sinon */
const ads = require('o-ads');
const main = require('../index');
const utils = require('../js/utils');
const markup = require('./helpers/markup');
const jsonpFetch = require('n-jsonp');
let sandbox;


describe('Main', () => {

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		markup.setupContainer();
		markup.set('<div class="o-ads"></div>');
	});

	afterEach(() => {
		sandbox.restore();
		markup.destroyContainer();
	});

	it('Should init if flag is set to true and appname given', () => {
		const flags = { get: () => true };
		const initSpy = sandbox.stub(ads, 'init', () => ({ slots: { initSlot: sinon.stub()}, config: sinon.stub() }));
		return main.onload(flags).then(() => {
			expect(initSpy).to.have.been.called;
		});
	});

	it('Should not init if an app name is flag is set to false', () => {
		const flags = { get: () => false };
		sandbox.stub(utils, 'getAppName', () => false );
		const initSpy = sandbox.stub(ads, 'init', () => ({ slots: { initSlot: sinon.stub() }}));
		sandbox.stub(ads.slots, 'initSlot');
		return main.onload(flags).then(() => {
			expect(initSpy).not.to.have.been.called;
		});
	});

	it('Should bind the adverts found on page to o-ads library', () => {
		const flags = { get: () => true };
		const adInit = sandbox.spy(ads.slots, 'initSlot');
		sandbox.stub(ads, 'init', () => ({slots: { initSlot: adInit }, config: sinon.stub }));
		return main.onload(flags).then(() => {
			expect(adInit).to.have.been.called;
		});
	});

	it('Should log info and performance mark for the first ad when ads are loaded in slots', (done) => {
		const flags = { get: () => true };
		sandbox.stub(utils, 'getAppName', () => 'earle' );
		//PhantomJS doesn't have window.performance so fake it
		if(!window.performance) {
			window.performance = { mark: () => {}};
		};
		const perfMark = sandbox.stub(window.performance, 'mark', () => true );
		const info = sandbox.stub(utils.log, 'info');
		main.onload(flags)
			.then(() =>{
				document.addEventListener('oAdsLogTestDone', () => {
					expect(info).to.have.been.calledWith('Ad loaded in slot');
					expect(perfMark).to.have.been.calledOnce;
					expect(perfMark).to.have.been.calledWith('firstAdLoaded');
					done();
				});
				document.dispatchEvent(new CustomEvent('oAds.complete', { detail: { type: 's1', slot: { gpt: { isEmpty: false }}}}));
				document.dispatchEvent(new CustomEvent('oAds.complete', { detail: { type: 's1', slot: { gpt: { isEmpty: false }}}}));
				document.dispatchEvent(new CustomEvent('oAdsLogTestDone', { detail: { type: 's1', slot: { gpt: { isEmpty: false }}}}));
			});


	});

	it('Should make a request to the ads API when on an article page and returns an empty object if an error occurred', () => {
		const flags = { get: () => true };
		const fakeArticleUuid = '123456';
		const fakeDfpSiteAndZone = 'test-unclassified';

		sandbox.stub(utils, 'getAppName', () => 'article' );
		sandbox.stub(utils, 'getReferrer', () => 'https://test-referrer.com/path?ignore=this#and-this');
		sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone);
		sandbox.stub(document, 'querySelector', () => ({getAttribute: () => fakeArticleUuid}));
		const fetchSpy = sandbox.stub(jsonpFetch, 'default', () => Promise.reject() );

		return main.onload(flags).then(() => {
			expect(fetchSpy).to.have.been.calledWith('https://ads-api.ft.com/v1/content/' + fakeArticleUuid + '?referrer=https%3A%2F%2Ftest-referrer.com%2Fpath');
			expect(ads.config().gpt.unitName).to.equal('5887/ft.com/' + fakeDfpSiteAndZone + '/' + fakeDfpSiteAndZone);
		});
	});

	it('Should only pass referrer to API if it exists', () => {
		const flags = { get: () => true };
		const fakeArticleUuid = '123456';
		const fakeDfpSiteAndZone = 'test-unclassified';

		sandbox.stub(utils, 'getAppName', () => 'article' );
		sandbox.stub(utils, 'getReferrer', () => null );
		sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone );
		sandbox.stub(document, 'querySelector', () => ({getAttribute: () => fakeArticleUuid}));
		const fetchSpy = sandbox.stub(jsonpFetch, 'default', () => Promise.reject() );

		return main.onload(flags).then(() => {
			expect(fetchSpy).to.have.been.calledWith('https://ads-api.ft.com/v1/content/' + fakeArticleUuid);
			expect(ads.config().gpt.unitName).to.equal('5887/ft.com/' + fakeDfpSiteAndZone + '/' + fakeDfpSiteAndZone);
		});
	});



	it('Should make make gpt unit name unclassified if API fails and no page metadata', () => {
		const flags = { get: () => true };
		const fakeArticleUuid = '123456';

		sandbox.stub(utils, 'getAppName', () => 'article' );
		sandbox.stub(utils, 'getReferrer', () => null );
		sandbox.stub(utils, 'getMetaData', () => null );
		sandbox.stub(document, 'querySelector', () => ({getAttribute: () => fakeArticleUuid}));
		const fetchSpy = sandbox.stub(jsonpFetch, 'default', () => Promise.reject() );

		return main.onload(flags).then(() => {
			expect(fetchSpy).to.have.been.calledWith('https://ads-api.ft.com/v1/content/' + fakeArticleUuid);
			expect(ads.config().gpt.unitName).to.equal('5887/ft.com/unclassified');
		});
	});

	it('Should make a request to the ads API when on an article page and returns the articles\' site and zone to the config', () => {
		const flags = { get: () => true };
		const fakeArticleUuid = '123456';
		const fakeDfpSiteAndZone = 'this-should-be-overwritten';

		sandbox.stub(utils, 'getAppName', () => 'article' );
		sandbox.stub(utils, 'getReferrer', () => null );
		sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone );
		sandbox.stub(document, 'querySelector', () => ({getAttribute: () => fakeArticleUuid}));
		const fetchSpy = sandbox.stub(jsonpFetch, 'default', () => {
			return Promise.resolve({
				json: () => {
					return {
						dfp: {
							adUnit: ['successful-site', 'successful-zone']
						},
						krux: {
							attributes: [ { key: 'topics', value: ['News'] } ]
						}
					};
				}
			});
		});

		return main.onload(flags).then(() => {
			expect(fetchSpy).to.have.been.calledWith('https://ads-api.ft.com/v1/content/' + fakeArticleUuid);
			expect(ads.config().gpt.unitName).to.equal('5887/ft.com/successful-site/successful-zone');
			expect(ads.config().krux.id).to.be.ok;
			expect(ads.config().krux.attributes.page.topics).to.be.ok;
		});
	});


	it('Should make a request to the ads API when on an stream page and returns the stream site and zone to the config', () => {
		const flags = { get: () => true };
		const fakeConceptId = '123456';
		const fakeDfpSiteAndZone = 'this-should-be-overwritten';

		sandbox.stub(utils, 'getAppName', () => 'stream-page' );
		sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone );
		sandbox.stub(document, 'querySelector', () => ({getAttribute: () => fakeConceptId}));
		const fetchSpy = sandbox.stub(jsonpFetch, 'default', () => {
			return Promise.resolve({
				json: () => {
					return {
						dfp: {
							adUnit: ['successful-site','successful-zone']
						}
					};
				}
			});
		});

		return main.onload(flags).then(() => {
			expect(fetchSpy).to.have.been.calledWith('https://ads-api.ft.com/v1/concept/' + fakeConceptId);
			expect(ads.config().gpt.unitName).to.equal('5887/ft.com/successful-site/successful-zone');
			expect(ads.config().krux.id).to.be.ok;
		});
	});

	it('Should make a request to the ads API for user data if flag on', () => {
		const flags = { get: () => true };
		const fakeConceptId = '123456';
		const fakeDfpSiteAndZone = 'this-should-be-overwritten';

		sandbox.stub(utils, 'getAppName', () => 'stream-page' );
		sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone );
		sandbox.stub(document, 'querySelector', () => ({getAttribute: () => fakeConceptId}));
		const fetchSpy = sandbox.stub(window, 'fetch', () => {
			return Promise.resolve({
				json: () => {
					return {
						dfp: {
							targeting: [{key: '1', value: 'a'}]
						}
					};
				}
			});
		});

		return main.onload(flags).then(() => {
			expect(fetchSpy).to.have.been.calledWith('https://ads-api.ft.com/v1/user');
		});
	});

	it('Should not make a request to the ads API for user data if flag off', () => {
		const flags = { get: (name) => name !== 'adTargetingUserApi'};

		sandbox.stub(utils, 'getAppName', () => 'stream-page' );
		sandbox.stub(document, 'querySelector', () => ({getAttribute: () => '12345'}));
		const fetchSpy = sandbox.stub(window, 'fetch');

		return main.onload(flags).then(() => {
			expect(fetchSpy).not.to.have.been.calledWith('https://ads-api.ft.com/v1/user');
		});
	});

	it('Should use the next.ft.com proxy if client does not support CORS with credentials', () => {
		const flags = { get: () => true };
		const fakeConceptId = '123456';
		const fakeDfpSiteAndZone = 'this-should-be-overwritten';
		Object.defineProperty(XMLHttpRequest.prototype, 'withCredentials', {
			configurable: true, // defaults to false
			writable: false,
			value: false
		});
		delete XMLHttpRequest.prototype.withCredentials;
		sandbox.stub(utils, 'getAppName', () => 'stream-page' );
		sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone );
		sandbox.stub(document, 'querySelector', () => ({getAttribute: () => fakeConceptId}));
		const fetchSpy = sandbox.stub(window, 'fetch', () => {
			return Promise.resolve({
				json: () => {
					return {
						dfp: {
							targeting: [{key: '1', value: 'a'}]
						}
					};
				}
			});
		});

		return main.onload(flags).then(() => {
			expect(fetchSpy).to.have.been.calledWith('/__ads-api/v1/user');
			Object.defineProperty(XMLHttpRequest.prototype, 'withCredentials', {
				configurable: true, // defaults to false
				writable: false,
				value: true
			});
		});
	});


});
