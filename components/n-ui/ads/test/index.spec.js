/* globals describe, it, beforeEach, afterEach,expect,sinon */
import ads from 'o-ads';
import main from '../index';
import markup from './helpers/markup';
const fakeArticleUuid = '123456';
const fakeUserId = '123-abc-uuid';
const fakeSpoorId = '123-abc-spoorId';
const AdsMetrics = require('../js/ads-metrics');

let sandbox;
let targeting;

const userData = {
	loggedInStatus: true,
	spoorId: fakeSpoorId,
	uuid: fakeUserId,
};

const pageData = {
	adUnit: ['companies', 'technology'],
	genre: ['News'],
	organisation: ['Apple Inc'],
	person: ['Tim Bradshaw', 'Anna Nicolaou'],
	specialReport: [],
	topic: ['Technology sector', 'US & Canadian companies', 'Media', 'Companies', 'Technology'],
	uuid: fakeArticleUuid,
};

describe('Main', () => {

	beforeEach(() => {
		sandbox = sinon.createSandbox();

		markup.setupContainer();
		markup.set('<div class="o-ads"></div>');
		targeting = sandbox.stub(document, 'querySelector');
		targeting.withArgs('[data-concept-id]').returns({ getAttribute: () => fakeArticleUuid });
		targeting.withArgs('[data-content-id]').returns({ getAttribute: () => fakeArticleUuid });
	});

	afterEach(() => {
		sandbox.restore();
		markup.destroyContainer();
	});

	it('Should init if flag is set to true and appname given', () => {
		const flags = { get: () => true };
		const initSpy = sandbox.stub(ads, 'init').callsFake(() => Promise.resolve({ slots: { initSlot: sinon.stub() }, config: sinon.stub() }));
		return main.init(flags, { name: 'article' }).then(() => {
			expect(initSpy).to.have.been.called;
		});
	});

	it('Should not init if an app name is flag is set to false', () => {
		const flags = { get: () => false };
		const initSpy = sandbox.stub(ads, 'init').callsFake(() => ({ slots: { initSlot: sinon.stub() } }));
		sandbox.stub(ads.slots, 'initSlot');
		return main.init(flags, {}).then(() => {
			expect(initSpy).not.to.have.been.called;
		});
	});

	it('Should bind the adverts found on page to o-ads library', () => {
		const flags = { get: () => true };
		const adInit = sandbox.stub(ads.slots, 'initSlot');

		sandbox.stub(ads, 'init').callsFake(() => Promise.resolve({
			targeting: {
				get: function () { return 'abc'; }
			},
			slots: { initSlot: adInit }, config: sinon.stub
		}));
		return main.init(flags, { name: 'article' }).then(() => {
			expect(adInit).to.have.been.called;
		});
	});

	it('Should setup ads monitoring functionality', () => {
		const flags = {
			get: () => true,
			adsDisableMetricsSampling: true
		};
		const setupMetricsStub = sandbox.stub(AdsMetrics, 'setupAdsMetrics');

		return main.init(flags, { name: 'article' }).then(() => {
			expect(setupMetricsStub).to.have.been.calledWith(true);
		});
	});

	describe('Targeting', () => {
		const flags = { get: () => true };

		beforeEach(() => {
			// Stub calls to Ads Api to retrieve user and content targeting data
			sandbox.stub(ads.api, 'getUserData').withArgs(ads.api.config.user).resolves(userData);
			sandbox.stub(ads.api, 'getPageData').withArgs(ads.api.config.page).resolves(pageData);
		});

		it('Should store user and content data retrieved via ads-api to targeting', () => {
			return main.init(flags, { name: 'article' }).then(() => {
				const targeting = ads.targeting.get();
				expect(targeting).to.have.property('user', userData);
				expect(targeting).to.have.property('content', pageData);
			});
		});
	});

	describe('GPT Zone', () => {

		describe('GPT Zone when NO adUnit coming from ads-api Content endpoint', () => {
			const flags = { get: () => true };
			const pageDataWithoutAdUnit = Object.assign({}, pageData, { adUnit: null });

			beforeEach(() => {
				// Stub calls to Ads Api to retrieve user and content targeting data
				sandbox.stub(ads.api, 'getUserData').withArgs(ads.api.config.user).resolves(userData);

				sandbox.stub(ads.api, 'getPageData')
					.withArgs(ads.api.config.page)
					.resolves(pageDataWithoutAdUnit);
			});

			it('Should set zone to unclassified', () => {
				const apiHandleResponse = sandbox.spy(ads.api, 'handleResponse');
				const apiAddZone = sandbox.spy(ads.api, 'addZone');
				const gptConfig = sandbox.spy(ads.api.instance, 'config').withArgs('gpt');

				return main.init(flags, { name: 'article' }).then(() => {
					expect(apiHandleResponse).to.have.been.calledWith([userData, pageDataWithoutAdUnit]);
					expect(apiAddZone).to.have.been.calledWith(pageDataWithoutAdUnit);
					expect(gptConfig).to.not.have.been.called;
					expect(ads.config('gpt')).to.have.property('zone', 'unclassified');
				});
			});
		});

		describe('GPT Zone when adUnit is coming from content ads-api Content endpoint', () => {
			const flags = { get: () => true };

			beforeEach(() => {
				// Stub calls to Ads Api to retrieve user and content targeting data
				sandbox.stub(ads.api, 'getUserData').withArgs(ads.api.config.user).resolves(userData);
				sandbox.stub(ads.api, 'getPageData').withArgs(ads.api.config.page).resolves(pageData);
			});

			it('Should set zone to whatever comes from content ads-api targeting endpoint', () => {
				const apiHandleResponse = sandbox.spy(ads.api, 'handleResponse');
				const apiAddZone = sandbox.spy(ads.api, 'addZone');
				const gptConfig = sandbox.spy(ads.api.instance, 'config').withArgs('gpt');

				return main.init(flags, { name: 'article' }).then(() => {
					expect(apiHandleResponse).to.have.been.calledWith([userData, pageData]);
					expect(apiAddZone).to.have.been.calledWith(pageData);
					expect(gptConfig).to.have.been.called;
					expect(ads.config('gpt')).to.have.property('zone', 'companies/technology');
				});
			});
		});

	});
});
