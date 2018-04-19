/*global require,describe,afterEach,beforeEach,it,expect,sinon*/
const AppInitializer = require('../js/app-initializer').AppInitializer;
const header = require('../../components/n-ui/header');
const footer = require('o-footer');
const date = require('o-date');
const cookieMessage = require('o-cookie-message');
const ads = require('../../components/n-ui/ads');
const tracking = require('../../components/n-ui/tracking');
const sw = require('n-service-worker');
const nImage = require('n-image');
const syndication = require('n-syndication');

describe('AppInitializer', () => {
	before(() => {
		window.FT = {
			flags: {aFlag: 'cohort'},
			conditions: {}
		};
	});

	beforeEach(() => {
		window.LUX = {mark: sinon.stub()};
		sinon.stub(header, 'init');
		sinon.stub(footer, 'init');
		sinon.stub(date, 'init');
		sinon.stub(ads, 'init');
		sinon.stub(cookieMessage, 'init');
		sinon.stub(tracking, 'init');
		sinon.stub(tracking, 'lazyInit');
		sinon.stub(sw, 'register').callsFake(() => Promise.resolve());
		sinon.stub(sw, 'message').callsFake(() => Promise.resolve());
		sinon.stub(sw, 'unregister');
		sinon.stub(nImage, 'lazyLoad');
		sinon.stub(syndication, 'init');
	});

	afterEach(() => {
		delete window.LUX;
		header.init.restore();
		footer.init.restore();
		date.init.restore();
		ads.init.restore();
		cookieMessage.init.restore();
		tracking.init.restore();
		tracking.lazyInit.restore();
		sw.register.restore();
		sw.message.restore();
		sw.unregister.restore();
		nImage.lazyLoad.restore();
		syndication.init.restore();
	});

	describe('constructor', () => {
		it('exposes appInfo', () => {
			document.documentElement.setAttribute('data-next-is-production', ''),
			document.documentElement.setAttribute('data-next-version', '1'),
			document.documentElement.setAttribute('data-next-app', 'appname'),
			document.documentElement.setAttribute('data-next-product', 'productname');

			const app = new AppInitializer();
			expect(app.env.appInfo.isProduction).to.equal(true);
			expect(app.env.appInfo.version).to.equal('1');
			expect(app.env.appInfo.name).to.equal('appname');
			expect(app.env.appInfo.product).to.equal('productname');

			document.documentElement.removeAttribute('data-next-is-production');
			document.documentElement.removeAttribute('data-next-version');
			document.documentElement.removeAttribute('data-next-app');
			document.documentElement.removeAttribute('data-next-product');
		});

		it('exposes flags with getters', () => {
			const app = new AppInitializer();
			expect(app.env.flags.get).to.be.a('function');
			expect(app.env.flags.getAll).to.be.a('function');
			expect(app.env.flags.aFlag).to.equal('cohort');
			expect(app.env.flags.get('aFlag')).to.equal('cohort');
		});

		it('exposes allStylesLoaded promise, which is resolved if styles already loaded', () => {
			window.FT.conditions.allStylesLoaded = true;
			const app = new AppInitializer();
			expect(app.env.allStylesLoaded.then).to.be.a('function');

			return app.env.allStylesLoaded
				.then(() => {
					expect(true); // will time out otherwise
					delete window.FT.conditions.AllStylesLoaded;
				});
		});

		it('exposes allStylesLoaded promise, which resolves after styles load', () => {
			const app = new AppInitializer();
			expect(app.env.allStylesLoaded.then).to.be.a('function');
			let isResolved = false;
			app.env.allStylesLoaded
				.then(() => {
					isResolved = true;
				});

			expect(isResolved).to.be.false;
			window.dispatchEvent(new CustomEvent('FT.allStylesLoaded'));
			return new Promise(res => (setTimeout(res, 50)))
				.then(() => {
					expect(isResolved).to.be.true;
				});
		});
	});

	describe('bootstrap', () => {
		let app;

		beforeEach(() => {
			app = new AppInitializer();
			sinon.stub(app, 'initializeComponents');
		});

		it('converts discrete preset to header, footer and date features', () => {

			app.bootstrap({preset: 'discrete'});
			expect(app.enabledFeatures).to.eql({
				header: true,
				footer: true,
				date: true
			});
		});

		it('converts complete preset to header, footer, date and intrusive features', () => {
			app.bootstrap({preset: 'complete'});
			expect(app.enabledFeatures).to.eql({
				header: true,
				footer: true,
				date: true,
				cookieMessage: true,
				ads: true,
				syndication: true,
				roe: true,
				evenMoreJanky: true
			});
		});

		it('overrides features in presets', () => {
			app.bootstrap({preset: 'discrete', features: {ads: true}});
			expect(app.enabledFeatures).to.eql({
				header: true,
				footer: true,
				date: true,
				ads: true
			});
		});

		it('calls initializeComponents', () => {
			app.bootstrap();
			expect(app.initializeComponents.called).to.be.true;
		});

		it('sets a perf mark', () => {
			app.bootstrap();
			expect(window.LUX.mark.calledWith('nUiJsExecuted')).to.be.true;
		});

		it('returns env object', () => {
			expect(app.bootstrap()).to.equal(app.env);
		});
	});

	describe('initializeComponents', () => {

		function initApp (features, flags, loadStyles) {
			const app = new AppInitializer();

			app.env.flags = Object.assign(flags || {}, {
				get: function (name) { return this[name]; }
			});

			if (loadStyles) {
				app.env.allStylesLoaded = Promise.resolve();
			}

			app.enabledFeatures = features;
			app.initializeComponents();
			return app;
		}

		it('always initializes tracking', () => {
			const app = initApp({});
			expect(tracking.init.calledWith(app.env.flags, app.env.appInfo)).to.be.true;
		});

		it('initializes service worker if flag is on', () => {
			const app = initApp({}, {serviceWorker: true});
			expect(sw.register.calledWith(app.env.flags)).to.be.true;
			expect(sw.message.calledWith({ type: 'updateCache', data: {}})).to.be.true;
		});

		it('unregisters service worker if flag is off', () => {
			initApp({}, {serviceWorker: false});
			expect(sw.unregister.called).to.be.true;
		});

		it('initializes header if feature is enabled', () => {
			const app = initApp({header: true});
			expect(header.init.calledWith(app.env.flags)).to.be.true;
		});

		it('does not initialize header if feature is disabled', () => {
			initApp({});
			expect(header.init.called).to.be.false;
		});

		it('initializes date if feature is enabled', () => {
			initApp({date: true});
			expect(date.init.called).to.be.true;
		});

		it('does not initialize date if feature is disabled', () => {
			initApp({});
			expect(date.init.called).to.be.false;
		});

		it('initializes ads if feature is enabled', () => {
			const app = initApp({ads: {adsConfig: true}});
			expect(ads.init.calledWith(app.env.flags, app.env.appInfo, app.enabledFeatures.ads)).to.be.true;
		});

		it('does not initialize ads if feature is disabled', () => {
			initApp({});
			expect(ads.init.called).to.be.false;
		});

		it('initializes lazy loaded images if feature is enabled', () => {
			initApp({lazyLoadImages: true});
			expect(nImage.lazyLoad.called).to.be.true;
		});

		it('does not initialize lazy loaded images if feature is disabled', () => {
			initApp({});
			expect(nImage.lazyLoad.called).to.be.false;
		});

		describe('after allStylesLoaded', () => {
			it('initializes footer if feature is enabled', () => {
				const app = initApp({footer: true}, null, true);
				expect(footer.init.called).to.be.false;
				return app.env.allStylesLoaded
					.then(() => expect(footer.init.called).to.be.true);
			});

			it('does not initialize footer if feature is disabled', () => {
				const app = initApp({}, null, true);
				return app.env.allStylesLoaded
					.then(() => expect(footer.init.called).to.be.false);
			});

			it('initializes cookie message if feature is enabled and flag is on', () => {
				const app = initApp({cookieMessage: true}, {cookieMessage: true}, true);
				expect(cookieMessage.init.called).to.be.false;
				return app.env.allStylesLoaded
					.then(() => expect(cookieMessage.init.called).to.be.true);
			});

			it('does not initialize cookie message if feature is disabled', () => {
				const app = initApp({}, {cookieMessage: true}, true);
				return app.env.allStylesLoaded
					.then(() => expect(cookieMessage.init.called).to.be.false);
			});

			it('does not initialize cookie message if flag is off', () => {
				const app = initApp({cookieMessage: true}, null, true);
				return app.env.allStylesLoaded
					.then(() => expect(cookieMessage.init.called).to.be.false);
			});

			it('initializes syndication if feature is enabled', () => {
				const app = initApp({syndication: true}, null, true);
				expect(syndication.init.called).to.be.false;
				return app.env.allStylesLoaded
					.then(() => expect(syndication.init.calledWith(app.env.flags)).to.be.true);
			});

			it('does not initialize syndication if feature is disabled', () => {
				const app = initApp({}, null, true);
				return app.env.allStylesLoaded
					.then(() => expect(syndication.init.called).to.be.false);
			});
		});
	});

	describe('onAppInitialiazed', () => {

		it('adds js-success class to html element', () => {
			new AppInitializer().onAppInitialized();
			expect(document.documentElement.classList.contains('js-success')).to.be.true;
		});

		it('sets a perf mark', () => {
			new AppInitializer().onAppInitialized();
			expect(window.LUX.mark.calledWith('appJsExecuted')).to.be.true;
		});

		it('initializes lazy tracking', () => {
			const app = new AppInitializer();
			app.onAppInitialized();
			expect(tracking.lazyInit.calledWith(app.env.flags)).to.be.true;
		});

		it.skip('dispatches loaded event after app is done (if done after window loaded)', () => {
			// no test written before, not gonna beat myself about not writing one in the new suite
		});

		it.skip('dispatches loaded event after window loaded (if app done before window loaded)', () => {
			// no test written before, not gonna beat myself about not writing one in the new suite
		});

	});
});
