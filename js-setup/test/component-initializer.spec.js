/*global require,describe,afterEach,beforeEach,it,expect,sinon*/
window.nextFeatureFlags = [{name: 'aFlag', state: true}];
const ComponentInitializer = require('../js/component-initializer').ComponentInitializer;
const jsLoader = require('../js/loader');
const header = require('../../header');
const footer = require('../../footer');
const date = require('../../date');
const ads = require('../../ads');
const tracking = require('../../tracking');

describe('bootstrapping', () => {
	beforeEach(() => {
		sinon.stub(header, 'init');
		sinon.stub(footer, 'init');
		sinon.stub(date, 'init');
		sinon.stub(ads, 'init');
		sinon.stub(tracking, 'init');
		sinon.stub(tracking, 'lazyInit');
		sinon.stub(jsLoader.prototype, 'bootstrap', (opts, cb) => {
			return cb({
				flags: {
					get: () => true
				},
				appInfo: {},
				mainCss: Promise.resolve()
			})
		})
	});

	afterEach(() => {
		jsLoader.prototype.bootstrap.restore();
		header.init.restore();
		footer.init.restore();
		date.init.restore();
		tracking.init.restore();
		tracking.lazyInit.restore();
		ads.init.restore();
	})

	it('binds bootstrap and configure to itself', () => {
		const CI = new ComponentInitializer();

		const parasite = {
			bootstrap: CI.bootstrap,
			configure: CI.configure
		};
		parasite.configure({parasite: true});
		expect(CI.configuration.parasite).to.be.true;
		parasite.bootstrap();
		expect(jsLoader.prototype.bootstrap.calledOnce).to.be.true;
	})

	it('always initialise tracking', () => {
		const cb = sinon.stub();
		const CI = new ComponentInitializer();
		return CI.bootstrap(null, cb)
			.then(() => {
				expect(CI.isInitialized('tracking')).to.be.true;
				expect(tracking.init.calledOnce).to.be.true;
				expect(cb.calledOnce).to.be.true;
			});
	});

	it('handles missing callback well', () => {
		const CI = new ComponentInitializer();
		return CI.bootstrap()
			.then(() => {
				expect('ok').to.equal('ok');
			});
	});

	it('can use preset', () => {
		const cb = sinon.stub();
		const CI = new ComponentInitializer();
		return CI.bootstrap({preset: 'discrete'}, cb)
			.then(() => {
				expect(CI.isInitialized('tracking')).to.be.true;
				expect(CI.isInitialized('header')).to.be.true;
				expect(CI.isInitialized('footer')).to.be.true;
				expect(CI.isInitialized('date')).to.be.true;
				expect(tracking.init.calledOnce).to.be.true;
				expect(header.init.calledOnce).to.be.true;
				expect(footer.init.calledOnce).to.be.true;
				expect(date.init.calledOnce).to.be.true;
				expect(cb.calledOnce).to.be.true;
			});
	});

	it('can pass in feature overrides', () => {
		const cb = sinon.stub();
		const CI = new ComponentInitializer();
		return CI.bootstrap({preset: 'discrete', features: {header: false, ads: true}}, cb)
			.then(() => {
				expect(CI.isInitialized('tracking')).to.be.true;
				expect(CI.isInitialized('header')).to.be.false;
				expect(CI.isInitialized('footer')).to.be.true;
				expect(CI.isInitialized('ads')).to.be.true;
				expect(CI.isInitialized('date')).to.be.true;
				expect(tracking.init.calledOnce).to.be.true;
				expect(header.init.calledOnce).to.be.false;
				expect(footer.init.calledOnce).to.be.true;
				expect(date.init.calledOnce).to.be.true;
				expect(ads.init.calledOnce).to.be.true;
				expect(cb.calledOnce).to.be.true;
			});
	});

	it('can call more than once without double init', () => {
		const cb = sinon.stub();
		const CI = new ComponentInitializer();
		return CI.bootstrap({preset: 'discrete'})
			.then(() => {
				return CI.bootstrap({preset: 'discrete', features: {ads: true}}, cb)
					.then(() => {
						expect(tracking.init.calledOnce).to.be.true;
						expect(header.init.calledOnce).to.be.true;
						expect(footer.init.calledOnce).to.be.true;
						expect(date.init.calledOnce).to.be.true;
						expect(ads.init.calledOnce).to.be.true;
						expect(cb.calledOnce).to.be.true;
					});
			});
	});


	describe('backwards compatibility', () => {

		it('can pass in a callback as first argument', () => {
			const CI = new ComponentInitializer();
			CI.configure({features: {header: true}});
			const cb = sinon.stub();
			return CI.bootstrap(cb)
				.then(() => {
					expect(CI.isInitialized('header')).to.be.true;
					expect(cb.calledOnce).to.be.true;
				});
		});

		it('can pass in null callback as first argument', () => {
			const CI = new ComponentInitializer();
			CI.configure({features: {header: true}});
			return CI.bootstrap(null)
				.then(() => {
					expect(CI.isInitialized('header')).to.be.true;
				});
		});

		it('can use flat config object', () => {
			const CI = new ComponentInitializer();
			CI.configure({header: true});
			const cb = sinon.stub();
			return CI.bootstrap(undefined, cb)
				.then(() => {
					expect(CI.isInitialized('header')).to.be.true;
					expect(cb.calledOnce).to.be.true;
				});
		});
	});
});
