/* globals describe, it, beforeEach, afterEach,expect,sinon */
const ads = require('o-ads');
const main = require('../index');
const utils = require('../js/utils');
const markup = require('./helpers/markup');
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
		const initSpy = sandbox.stub(ads, 'init', () => Promise.resolve({ slots: { initSlot: sinon.stub()}, config: sinon.stub() }));
		return main.init(flags, { name: 'article' }).then(() => {
			expect(initSpy).to.have.been.called;
		});
	});

	it('Should not init if an app name is flag is set to false', () => {
		const flags = { get: () => false };
		const initSpy = sandbox.stub(ads, 'init', () => ({ slots: { initSlot: sinon.stub() }}));
		sandbox.stub(ads.slots, 'initSlot');
		return main.init(flags, {}).then(() => {
			expect(initSpy).not.to.have.been.called;
		});
	});

	it('Should bind the adverts found on page to o-ads library', () => {
		const flags = { get: () => true };
		const adInit = sandbox.stub(ads.slots, 'initSlot');
		sandbox.stub(ads, 'init', () => Promise.resolve({
			targeting : {
				get : function (){return 'abc';}
			},
			slots: { initSlot: adInit }, config: sinon.stub }));
		return main.init(flags, { name: 'article' }).then(() => {
			expect(adInit).to.have.been.called;
		});
	});

	it('Should call consolidateMetrics before initSlot', () => {
		const flags = { get: () => true };
		const adInit = sandbox.stub(ads.slots, 'initSlot');
		const consolidateMetrics = sandbox.stub(utils, 'consolidateMetrics');
		sandbox.stub(ads, 'init', () => Promise.resolve({
			targeting : {
				get : function (){return 'abc';}
			},
			slots: { initSlot: adInit }, config: sinon.stub }));
		return main.init(flags, { name: 'article' }).then(() => {
			expect(consolidateMetrics).to.have.been.called;
		});
	});


	it('Should log info and performance mark for the first ad when ads are loaded in slots', (done) => {
		const flags = { get: () => true };
		//PhantomJS doesn't have window.performance so fake it
		if(!window.performance) {
			window.performance = { mark: () => {}};
		};
		const perfMark = sandbox.stub(window.performance, 'mark', () => true );
		const info = sandbox.stub(utils.log, 'info');
		main.init(flags, { name: 'earle' })
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
});
