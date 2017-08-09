/* globals describe, it, beforeEach, afterEach,expect,sinon */
const utils = require('../js/utils');
const oAdsConfig = require('../js/oAdsConfig');
const adsSandbox = require('../js/sandbox');
const fakeArticleUuid = '123456';
const fakeConceptUuid = '12345678';

let sandbox;
let targeting;

describe('Config', () => {

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		// global stubs

		sandbox.stub(utils, 'getLayoutName').callsFake(() => 'custom');
		sandbox.stub(utils, 'getReferrer').callsFake(() => null );
		targeting = sandbox.stub(document.documentElement, 'getAttribute');
		targeting.withArgs('data-content-id').returns(fakeArticleUuid);

	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('third party', () => {

		it('Should set gpt configuration value according to app name', () => {
			const flags = { get: () => true };
			const config = oAdsConfig(flags, 'article', false);
			const gptAttributes = {
				network: '5887',
				site: 'ft.com',
				zone: 'unclassified'
			};

			expect(config.gpt).to.deep.equal(gptAttributes);
		});

		it('Should set gpt configuration value according to app name and sandbox', () => {
			const flags = { get: () => true };
			sandbox.stub(adsSandbox, 'isActive').callsFake(() => true);
			const config = oAdsConfig(flags, 'article');
			const gptAttributes = {
				network: '5887',
				site: 'sandbox.next.ft',
				zone: 'unclassified'
			};
			expect(config.gpt).to.deep.equal(gptAttributes);
		});


		it('Should set krux configuration when flag is set to false', () => {
			const flags = { get: () => true };
			document.cookie = 'FT_U=EID=1234_PID=abc';
			const config = oAdsConfig(flags, 'article' );
			const userExpectation = {
				eid: '1234'
			};

			expect(config.krux.id).to.be.ok;
			expect(config.krux.attributes).to.be.ok;
			expect(config.krux.attributes.user).to.be.ok;
			expect(config.krux.attributes.user).to.deep.equal(userExpectation);
		});

		it('Should not set krux configuration when flag is set to false', () => {
			const flags = { get: (param) => param === 'krux' ? false : true };
			const config = oAdsConfig(flags, 'article' );

			expect(config.krux).to.be.false;
		});

		it('Should not set krux configuration when app requests no targeting', () => {
			const flags = { get: () => true };
			const config = oAdsConfig(flags, 'article', { noTargeting: true } );

			expect(config.krux).to.be.false;
		});
		it('Should set dfp_targeting config', () => {
			const flags = { get: () => true };
			const config = oAdsConfig(flags, 'article' );
			document.cookie = 'FT_U=EID=1234_PID=abc';
			const expectation = 'pt=art;eid=1234;nlayout=custom'.split(';');


			expectation.forEach((value) => expect(config.dfp_targeting).to.contain(value));
		});

		it('Should use zone from metadata if present', () => {
			sandbox.stub(utils, 'getMetaData').callsFake((param) => {
				switch (param) {
					case 'dfp_site':
							return 'testDfpSite';
						break;
					case 'dfp_zone':
							return 'testDfpZone';
						break;
				}
			});

			const flags = { get: () => true };
			const config = oAdsConfig(flags, 'article');
			expect(config.gpt.zone).to.equal('testDfpSite/testDfpZone');
		});

	});

	describe('lazyLoad viewportMargin', () => {

	// tests for adOptimizeLazyLoad flag
		it('Should pass 0% when screen size is wider than 980px and adOptimizeLazyLoad flag is defined', () => {
			sandbox.stub(utils, 'getScreenSize').callsFake(() => 980);
			const flags = { get: (flagName) => {
				switch (flagName) {
					case 'adOptimizeLazyLoad':
					return '50';
					break;
					default:
					return true;
				}
			}};
			const config = oAdsConfig(flags, 'article');
			expect(config.lazyLoad.viewportMargin).to.equal('0%');
		});

		it('Should pass 0% when screen size is less than 980px and adOptimizeLazyLoad flag is undefined', () => {
			sandbox.stub(utils, 'getScreenSize').callsFake(() => 979);
			const flags = { get: (flagName) => {
				switch (flagName) {
					case 'adOptimizeLazyLoad':
					return undefined;
					break;
					default:
					return true;
				}
			}};
			const config = oAdsConfig(flags, 'article');
			expect(config.lazyLoad.viewportMargin).to.equal('0%');
		});

		context('when screen size is less than 980px and adOptimizeLazyLoad flag is defined', () => {

			beforeEach(() => {
				sandbox.stub(utils, 'getScreenSize').callsFake(() => 979);
			});

			afterEach(() => {
				sandbox.restore();
			});

			['50', '100', '150'].forEach( margin => {

				it(`Should pass ${margin}% when the flag\'s value is ${margin}`, () => {
					const flags = { get: (flagName) => {
						switch (flagName) {
							case 'adOptimizeLazyLoad':
							return margin;
							break;
							default:
							return true;
						}
					}};
					const config = oAdsConfig(flags, 'article');
					expect(config.lazyLoad.viewportMargin).to.equal(`${margin}%`);
				});

			});

		});

	});

	describe('o-ads', () => {

		it('Should pass the correct url to o-ads fetch', () => {
			const flags = { get: () => true };
			const config = oAdsConfig(flags, 'article' );
			const userUrl = 'https://ads-api.ft.com/v1/user';
			const pageUrl = 'https://ads-api.ft.com/v1/content/';

			expect(config.targetingApi.user).to.equal(userUrl);
			expect(config.targetingApi.page).to.equal(pageUrl + fakeArticleUuid);
		});

		it('Should not request API targeting if app says not to', () => {
			const flags = { get: () => true };
			const config = oAdsConfig(flags, 'article', { noTargeting: true });
			expect(config.targetingApi).to.equal(null);
		});

		it('Should access v2 concept url to send to o-ads fetch if present', () => {
			targeting.withArgs('data-concept-id').returns(fakeConceptUuid);

			const flags = { get: () => true };
			const config = oAdsConfig(flags, 'stream-page' );
			const pageUrl = 'https://ads-api.ft.com/v1/concept/';

			expect(config.targetingApi.page).to.equal(pageUrl + fakeConceptUuid);
		});

	});

});
