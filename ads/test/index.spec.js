/* globals describe, it, beforeEach, afterEach,expect,sinon */
const ads = require('o-ads');
const main = require('../index');
const utils = require('../js/utils');
const markup = require('./helpers/markup');
const fetchMock = require('fetch-mock');
const fakeArticleUuid = '123456';

let sandbox;
let targeting;


describe('Main', () => {

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		markup.setupContainer();
		markup.set('<div class="o-ads"></div>');
		targeting = sandbox.stub(document, 'querySelector');
		targeting.withArgs('[data-concept-id]').returns({getAttribute: () => fakeArticleUuid});
		targeting.withArgs('[data-content-id]').returns({getAttribute: () => fakeArticleUuid});
	});

	afterEach(() => {
		sandbox.restore();
		markup.destroyContainer();
	});

	it('Should init if flag is set to true and appname given', () => {
		const flags = { get: () => true };
		const initSpy = sandbox.stub(ads, 'init', () => ({ slots: { initSlot: sinon.stub()}, config: sinon.stub() }));
		return main.init(flags).then(() => {
			expect(initSpy).to.have.been.called;
		});
	});

	it('Should not init if an app name is flag is set to false', () => {
		const flags = { get: () => false };
		sandbox.stub(utils, 'getAppName', () => false );
		const initSpy = sandbox.stub(ads, 'init', () => ({ slots: { initSlot: sinon.stub() }}));
		sandbox.stub(ads.slots, 'initSlot');
		return main.init(flags).then(() => {
			expect(initSpy).not.to.have.been.called;
		});
	});

	it('Should bind the adverts found on page to o-ads library', () => {
		const flags = { get: () => true };
		const adInit = sandbox.stub(ads.slots, 'initSlot');
		sandbox.stub(ads, 'init', () => ({slots: { initSlot: adInit }, config: sinon.stub }));
		return main.init(flags).then(() => {
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
		main.init(flags)
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
		const fakeDfpSiteAndZone = 'test-unclassified';

		sandbox.stub(utils, 'getAppName', () => 'article' );
		sandbox.stub(utils, 'getReferrer', () => 'https://test-referrer.com/path?ignore=this#and-this');
		sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone);
		fetchMock
			.mock('^https://ads-api.ft.com/v1/content', Promise.reject())
			.catch(Promise.reject());
		return main.init(flags).then(() => {
			expect(fetchMock.lastCall('^https://ads-api.ft.com/v1/content')[0]).to.equal('https://ads-api.ft.com/v1/content/' + fakeArticleUuid + '?referrer=https%3A%2F%2Ftest-referrer.com%2Fpath');
			expect(fetchMock.lastCall('^https://ads-api.ft.com/v1/content')[1].useCorsProxy).to.be.true;
			expect(ads.config().gpt.unitName).to.equal('5887/ft.com/' + fakeDfpSiteAndZone + '/' + fakeDfpSiteAndZone);
			fetchMock.restore();
		});
	});

	it('Should only pass referrer to API if it exists', () => {
		const flags = { get: () => true };
		const fakeDfpSiteAndZone = 'test-unclassified';

		sandbox.stub(utils, 'getAppName', () => 'article' );
		sandbox.stub(utils, 'getReferrer', () => null );
		sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone );
		fetchMock
			.mock('^https://ads-api.ft.com/v1/content', Promise.reject())
			.catch(Promise.reject());

		return main.init(flags).then(() => {
			expect(fetchMock.lastCall('^https://ads-api.ft.com/v1/content')[0]).to.equal('https://ads-api.ft.com/v1/content/' + fakeArticleUuid);
			expect(ads.config().gpt.unitName).to.equal('5887/ft.com/' + fakeDfpSiteAndZone + '/' + fakeDfpSiteAndZone);
			fetchMock.restore();
		});
	});

	it('Should make make gpt unit name unclassified if API fails and no page metadata', () => {
		const flags = { get: () => true };

		sandbox.stub(utils, 'getAppName', () => 'article' );
		sandbox.stub(utils, 'getReferrer', () => null );
		sandbox.stub(utils, 'getMetaData', () => null );


		fetchMock
			.mock('^https://ads-api.ft.com/v1/content', Promise.reject())
			.catch(Promise.reject());

		return main.init(flags).then(() => {
			expect(fetchMock.lastCall('^https://ads-api.ft.com/v1/content')[0]).to.equal('https://ads-api.ft.com/v1/content/' + fakeArticleUuid);
			expect(ads.config().gpt.unitName).to.equal('5887/ft.com/unclassified');
			fetchMock.restore();
		});
	});

	it('Should make a request to the ads API when on an article page and returns the articles\' site and zone to the config', () => {
		const flags = { get: () => true };
		const fakeDfpSiteAndZone = 'this-should-be-overwritten';

		sandbox.stub(utils, 'getAppName', () => 'article' );
		sandbox.stub(utils, 'getReferrer', () => null );
		sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone );
		fetchMock
			.mock('^https://ads-api.ft.com/v1/content', {
				dfp: {
					adUnit: ['successful-site', 'successful-zone']
				},
				krux: {
					attributes: [ { key: 'topics', value: ['News'] } ]
				}
			})
			.catch(Promise.reject());

		return main.init(flags).then(() => {
			expect(fetchMock.lastCall('^https://ads-api.ft.com/v1/content')[0]).to.equal('https://ads-api.ft.com/v1/content/' + fakeArticleUuid);
			expect(ads.config().gpt.unitName).to.equal('5887/ft.com/successful-site/successful-zone');
			expect(ads.config().krux.id).to.be.ok;
			expect(ads.config().krux.attributes.page.topics).to.be.ok;
			fetchMock.restore();
		});
	});


	it('Should make a request to the ads API when on an stream page and returns the stream site and zone to the config', () => {
		const flags = { get: () => true };
		const fakeDfpSiteAndZone = 'this-should-be-overwritten';

		sandbox.stub(utils, 'getAppName', () => 'stream-page' );
		sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone );
		fetchMock
			.mock('^https://ads-api.ft.com/v1/concept', {
				dfp: {
					adUnit: ['successful-site', 'successful-zone']
				}
			})
			.catch(Promise.reject());

		return main.init(flags).then(() => {
			expect(fetchMock.lastCall('^https://ads-api.ft.com/v1/concept')[0]).to.equal('https://ads-api.ft.com/v1/concept/' + fakeArticleUuid);
			expect(fetchMock.lastCall('^https://ads-api.ft.com/v1/concept')[1].useCorsProxy).to.be.true;
			expect(ads.config().gpt.unitName).to.equal('5887/ft.com/successful-site/successful-zone');
			expect(ads.config().krux.id).to.be.ok;
			fetchMock.restore();
		});
	});

	it('Should make a request to the ads API for user data if flag on', () => {
		const flags = { get: () => true };
		const fakeDfpSiteAndZone = 'this-should-be-overwritten';

		sandbox.stub(utils, 'getAppName', () => 'stream-page' );
		sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone );
		fetchMock
			.mock('https://ads-api.ft.com/v1/user', {
				dfp: {
					targeting: [{key: '1', value: 'a'}]
				}
			})
			.catch(Promise.reject());

		return main.init(flags).then(() => {
			expect(fetchMock.called('https://ads-api.ft.com/v1/user')).to.be.true;
			expect(fetchMock.lastCall('https://ads-api.ft.com/v1/user')[1].useCorsProxy).to.be.true;
			fetchMock.restore();
		});
	});

	it('Should not make a request to the ads API for user data if flag off', () => {
		const flags = { get: (name) => name !== 'adTargetingUserApi'};

		sandbox.stub(utils, 'getAppName', () => 'stream-page' );
		fetchMock
			.mock('https://ads-api.ft.com/v1/user', 200)
			.catch(Promise.reject());

		return main.init(flags).then(() => {
			expect(fetchMock.called('https://ads-api.ft.com/v1/user')).to.be.false;
			fetchMock.restore();
		});
	});


});
