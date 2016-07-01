window.nextFeatureFlags = [{name: 'aFlag', state: true}];
const nUi = require('../main');
const layout = require('../layout');
const header = require('../header');
const footer = require('../footer');
const date = require('../date');
const ads = require('../ads');
const tracking = require('../tracking');

describe('n-ui', () => {
	describe('bootstrapping', () => {
		beforeEach(() => {
			sinon.stub(header, 'init');
			sinon.stub(footer, 'init');
			sinon.stub(date, 'init');
			sinon.stub(ads, 'init');
			sinon.stub(tracking, 'init');
			sinon.stub(layout, 'bootstrap', cb => {
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
			layout.bootstrap.restore();
			header.init.restore();
			footer.init.restore();
			date.init.restore();
			tracking.init.restore();
			ads.init.restore();
			nUi.reset();
		})

		it('always initialise tracking', () => {
			const cb = sinon.stub();
			return nUi.bootstrap(null, cb)
				.then(() => {
					expect(nUi.isInitialized('tracking')).to.be.true;
					expect(tracking.init.calledOnce).to.be.true;
					expect(cb.calledOnce).to.be.true;
				});
		});

		it('handles missing callback well', () => {
			const cb = sinon.stub();
			return nUi.bootstrap()
				.then(() => {
					expect('ok').to.equal('ok');
				});
		});

		it('can use preset', () => {
			const cb = sinon.stub();
			return nUi.bootstrap({preset: 'discrete'}, cb)
				.then(() => {
					expect(nUi.isInitialized('tracking')).to.be.true;
					expect(nUi.isInitialized('header')).to.be.true;
					expect(nUi.isInitialized('footer')).to.be.true;
					expect(nUi.isInitialized('date')).to.be.true;
					expect(tracking.init.calledOnce).to.be.true;
					expect(header.init.calledOnce).to.be.true;
					expect(footer.init.calledOnce).to.be.true;
					expect(date.init.calledOnce).to.be.true;
					expect(cb.calledOnce).to.be.true;
				});
		});

		it('can pass in feature overrides', () => {
			const cb = sinon.stub();
			return nUi.bootstrap({preset: 'discrete', features: {header: false, ads: true}}, cb)
				.then(() => {
					expect(nUi.isInitialized('tracking')).to.be.true;
					expect(nUi.isInitialized('header')).to.be.false;
					expect(nUi.isInitialized('footer')).to.be.true;
					expect(nUi.isInitialized('ads')).to.be.true;
					expect(nUi.isInitialized('date')).to.be.true;
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
			return nUi.bootstrap({preset: 'discrete'})
				.then(() => {
					return nUi.bootstrap({preset: 'discrete', features: {ads: true}}, cb)
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
				nUi.configure({features: {header: true}});
				const cb = sinon.stub();
				return nUi.bootstrap(cb)
					.then(() => {
						expect(nUi.isInitialized('header')).to.be.true;
						expect(cb.calledOnce).to.be.true;
					});
			});

			it('can pass in null callback as first argument', () => {
				nUi.configure({features: {header: true}});
				return nUi.bootstrap(null)
					.then(() => {
						expect(nUi.isInitialized('header')).to.be.true;
					});
			});

			it('can use flat config object', () => {
				nUi.configure({header: true});
				const cb = sinon.stub();
				return nUi.bootstrap(undefined, cb)
					.then(() => {
						expect(nUi.isInitialized('header')).to.be.true;
						expect(cb.calledOnce).to.be.true;
					});
			});
		});
	});

	describe('entry points', () => {
		['ads', 'tracking', 'date', 'header', 'promoMessages', 'cookieMessage', 'welcomeMessage', 'messagePrompts', 'myft', 'utils', 'ftdomdelegate', 'superstore', 'superstoreSync', 'React', 'ReactDom', 'notification', 'expander', 'grid', 'overlay', 'viewport']
			.forEach(mod => {
				it(`should export _${mod}`, () => {
					expect(nUi['_' + mod]).to.exist;
				})
			})
	});



})
