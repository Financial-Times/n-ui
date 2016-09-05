/* globals describe, it, beforeEach, afterEach,expect,sinon */
const utils = require('../js/utils');
const oAdsConfig = require('../js/oAdsConfig');
const adsSandbox = require('../js/sandbox');

let sandbox;

describe('Config', () => {

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		// global stubs
		sandbox.stub(utils, 'getAppName', () => {
			return 'testAppName';
		});
		sandbox.stub(utils, 'getLayoutName', () => {
			return 'custom';
		});
		sandbox.stub(utils, 'getMetaData', (param) => {
			switch (param) {
				case 'dfp_site':
						return 'testDfpSite';
					break;
				case 'dfp_zone':
						return 'testDfpZone';
					break;
			}
		});

	});

	afterEach(() => {
		sandbox.restore();
	});


	it('Should set gpt configuration value according to app name', () => {
		const flags = { get: () => true };
		const config = oAdsConfig(flags, {});
		expect(config.gpt.unitName).to.equal('5887/ft.com/testDfpSite/testDfpZone');
	});

	it('Should set gpt configuration value according to app name and sandbox', () => {
		const flags = { get: () => true };
		sandbox.stub(adsSandbox, 'isActive', () => {
			return true;
		});
		const config = oAdsConfig(flags, {});
		expect(config.gpt.unitName).to.equal('5887/sandbox.next.ft/testDfpSite/testDfpZone');
	});


	it('Should set krux configuration when flag is set to false', () => {
		const flags = { get: () => true };
		document.cookie = "FT_U=EID=1234_PID=abc";
		const config = oAdsConfig(flags, {});
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
		const config = oAdsConfig(flags, {});
		expect(config.krux).to.be.false;
	});

	it('Should set dfp_targeting config', () => {
		const flags = { get: () => true };
		const config = oAdsConfig(flags, {});
		document.cookie = "FT_U=EID=1234_PID=abc";
		const expectation = 'pt=unk;eid=1234;nlayout=custom'.split(';');

		expectation.forEach((value) => expect(config.dfp_targeting).to.contain(value));
	});

	it('Should use Site and Zone from targeting data if it exists', () => {
		const flags = { get: () => true };
		const targetingData = { dfp: { adUnit: ['dfpSiteFromData', 'dfpZoneFromData'] } };
		const config = oAdsConfig(flags, targetingData);
		expect(config.gpt.unitName).to.equal('5887/ft.com/dfpSiteFromData/dfpZoneFromData');
	});


	it('Should add targeting key values from API if it exists', () => {
		const flags = { get: () => true };
		const context = { dfp: { targeting : [ {key: 'context-a', value: 1} , { key: 'context-b', value: 2 } ] } };
		const user = { dfp: { targeting : [ {key: 'user-a', value: 1} , { key: 'user-b', value: 2 } ] } };
		const empty = { dfp: { targeting : [] } };
		const withTargeting = oAdsConfig(flags, context, user);
		const withoutTargeting = oAdsConfig(flags, empty);
		const withoutAnything = oAdsConfig(flags, null);
		expect(withTargeting.dfp_targeting).to.contain('context-a=1;context-b=2;user-a=1;user-b=2');
		expect(withoutTargeting.dfp_targeting).not.to.contain('context-a=1');
		expect(withoutTargeting.dfp_targeting).not.to.contain('user-a=1');
		expect(withoutAnything.dfp_targeting).not.to.contain('context-a=1');
		expect(withoutAnything.dfp_targeting).not.to.contain('user-a=1');
	});

	it('Should add krux page attributes from API if it exists', () => {
		const flags = { get: () => true };
		const withAttrs = oAdsConfig(flags, { krux: { attributes : [ {key: 'a', value: 1} , { key: 'b', value: 2 } ] } });
		const withoutAttrs = oAdsConfig(flags, { krux: { attributes : [] } });
		const withoutAnything = oAdsConfig(flags, null);
		expect(withAttrs.krux.attributes.page.unitName).to.equal('5887/ft.com/testDfpSite/testDfpZone');
		expect(withAttrs.krux.attributes.page.a).to.equal(1);
		expect(withAttrs.krux.attributes.page.b).to.equal(2);
		expect(withoutAttrs.krux.attributes.page.unitName).to.equal('5887/ft.com/testDfpSite/testDfpZone');
		expect(withoutAttrs.krux.attributes.page.a).to.be.undefined;
		expect(withoutAttrs.krux.attributes.page.b).to.be.undefined;
		expect(withoutAnything.krux.attributes.page.unitName).to.equal('5887/ft.com/testDfpSite/testDfpZone');
		expect(withoutAnything.krux.attributes.page.a).to.be.undefined;
		expect(withoutAnything.krux.attributes.page.b).to.be.undefined;
	});

	it('Should add krux user attributes from API if it exists', () => {
		const flags = { get: () => true };
		const withAttrs = oAdsConfig(flags, null, { krux: { attributes : [ {key: 'a', value: 1} , { key: 'b', value: 2 } ] } });
		const withoutAttrs = oAdsConfig(flags, null, { krux: { attributes : [] } });
		const withoutAnything = oAdsConfig(flags, null);
		expect(withAttrs.krux.attributes.user.a).to.equal(1);
		expect(withAttrs.krux.attributes.user.b).to.equal(2);
		expect(withoutAttrs.krux.attributes.user.a).to.be.undefined;
		expect(withoutAttrs.krux.attributes.user.b).to.be.undefined;
		expect(withoutAnything.krux.attributes.user.a).to.be.undefined;
		expect(withoutAnything.krux.attributes.user.b).to.be.undefined;
	});
});
