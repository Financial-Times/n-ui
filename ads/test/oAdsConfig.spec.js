/* globals describe, it, beforeEach, afterEach,expect,sinon */
const utils = require('../js/utils');
const oAdsConfig = require('../js/oAdsConfig');
const adsSandbox = require('../js/sandbox');
const fakeArticleUuid = '123456';

let sandbox;
let targeting;

describe('Config', () => {

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		// global stubs

		sandbox.stub(utils, 'getLayoutName', () => { return 'custom'; });
		sandbox.stub(utils, 'getReferrer', () => null );

		targeting = sandbox.stub(document, 'querySelector');
		targeting.withArgs('[data-concept-id]').returns({getAttribute: () => fakeArticleUuid});
		targeting.withArgs('[data-content-id]').returns({getAttribute: () => fakeArticleUuid});
	});

	afterEach(() => {
		sandbox.restore();
	});


	it('Should set gpt configuration value according to app name', () => {
		sandbox.stub(utils, 'getAppName', () => { return 'article'; });
		const flags = { get: () => true };
		const config = oAdsConfig(flags);
		const gptAttributes = {
														network: '5887',
														site: 'ft.com',
														zone: 'unclassified'
												}

		expect(config.gpt).to.deep.equal(gptAttributes);
	});

	it('Should set gpt configuration value according to app name and sandbox', () => {
		const flags = { get: () => true };
		sandbox.stub(adsSandbox, 'isActive', () => { return true; });
		sandbox.stub(utils, 'getAppName', () => { return 'article'; });
		const config = oAdsConfig(flags);
		const gptAttributes = {
														network: '5887',
														site: 'sandbox.next.ft',
														zone: 'unclassified'
												}
		expect(config.gpt).to.deep.equal(gptAttributes);
	});


	it('Should set krux configuration when flag is set to false', () => {
		const flags = { get: () => true };
		document.cookie = "FT_U=EID=1234_PID=abc";
		const config = oAdsConfig(flags);
		const userExpectation = {
			eid: '1234'
		};
		sandbox.stub(utils, 'getAppName', () => { return 'article'; });

		expect(config.krux.id).to.be.ok;
		expect(config.krux.attributes).to.be.ok;
		expect(config.krux.attributes.user).to.be.ok;
		expect(config.krux.attributes.user).to.deep.equal(userExpectation);
	});

	it('Should not set krux configuration when flag is set to false', () => {
		const flags = { get: (param) => param === 'krux' ? false : true };
		const config = oAdsConfig(flags);
		sandbox.stub(utils, 'getAppName', () => { return 'article'; });

		expect(config.krux).to.be.false;
	});

	it('Should set dfp_targeting config', () => {
		sandbox.stub(utils, 'getAppName', () => { return 'article'; });
		const flags = { get: () => true };
		const config = oAdsConfig(flags);
		document.cookie = "FT_U=EID=1234_PID=abc";
		const expectation = 'pt=art;eid=1234;nlayout=custom'.split(';');


		expectation.forEach((value) => expect(config.dfp_targeting).to.contain(value));
	});

	it('Should pass the correct url to o-ads fetch', () => {
		sandbox.stub(utils, 'getAppName', () => { return 'article'; });
		const flags = { get: () => true };
		const config = oAdsConfig(flags);
		const userUrl = 'https://ads-api.ft.com/v1/user'
		const pageUrl = 'https://ads-api.ft.com/v1/content/'



		expect(config.targetingApi.user).to.equal(userUrl);
		expect(config.targetingApi.page).to.equal(pageUrl + fakeArticleUuid);
	})

	it('Should access concept url to send to o-ads fetch', () => {
		sandbox.stub(utils, 'getAppName', () => { return 'stream-page'; });
		const flags = { get: () => true };
		const config = oAdsConfig(flags);
		const pageUrl = 'https://ads-api.ft.com/v1/concept/'


		expect(config.targetingApi.page).to.equal(pageUrl + fakeArticleUuid);
	})

	// it('Should not make a request to the ads API for user data if flag off', () => {
	// 	const flags = { get: (name) => name !== 'adTargetingUserApi'};
	//
	// 	sandbox.stub(utils, 'getAppName', () => 'stream-page' );
	// 	fetchMock
	// 		.mock('https://ads-api.ft.com/v1/user', 200)
	// 		.catch(Promise.reject());
	//
	// 	return main.init(flags).then(() => {
	// 		expect(fetchMock.called('https://ads-api.ft.com/v1/user')).to.be.false;
	// 		fetchMock.restore();
	// 	});
	// });


	// it('Should only pass referrer to API if it exists', () => {
	// 	const flags = { get: () => true };
	// 	const fakeDfpSiteAndZone = 'test-unclassified';
	//
	// 	sandbox.stub(utils, 'getAppName', () => 'article' );
	// 	sandbox.stub(utils, 'getReferrer', () => null );
	// 	sandbox.stub(utils, 'getMetaData', () => fakeDfpSiteAndZone );
	// 	fetchMock
	// 		.mock('^https://ads-api.ft.com/v1/content', Promise.reject())
	// 		.catch(Promise.reject());
	//
	// 	return main.init(flags).then(() => {
	// 		expect(fetchMock.lastCall('^https://ads-api.ft.com/v1/content')[0]).to.equal('https://ads-api.ft.com/v1/content/' + fakeArticleUuid);
	// 		expect(ads.config().gpt.unitName).to.equal('5887/ft.com/' + fakeDfpSiteAndZone + '/' + fakeDfpSiteAndZone);
	// 		fetchMock.restore();
	// 	});
	// });

});
