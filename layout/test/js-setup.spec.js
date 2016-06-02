/*global require,describe,afterEach,beforeEach,it,expect*/
window.nextFeatureFlags = [{name: 'aFlag', state: true}];
const nThirdPartyCode = require('n-third-party-code');
const jsSetup = require('../index');
const JsSetup = require('../js/js-setup');
const oErrors = require('o-errors');

describe('js setup', function () {

	it('should polyfill fetch', function () {
		expect(window.fetch).to.be.a('function');
	});

	it('should have an init method', function () {
		expect(jsSetup.init).to.be.a('function');
	});

	it('should have an bootstrap method', function () {
		expect(jsSetup.bootstrap).to.be.a('function');
	});

	it('should stub console, if applicable', function () {
		expect(window.console).to.exist;
	});

	describe('init with flags off', function () {
		before(() => window.nextFeatureFlags = []);
		after(() => delete window.nextFeatureFlags);

		it('should disable o-errors', function (done) {
			const spy = sinon.stub(oErrors, 'init');
			const promise = new JsSetup().init();
			promise.then(function () {
				expect(spy.calledOnce).to.be.true;
				expect(spy.args[0][0].enabled).to.be.falsy;
				spy.restore();
				done();
			})
		});


		it('should return promise of useful things', function (done) {
			document.documentElement.setAttribute('data-next-is-production', '');
			document.documentElement.setAttribute('data-next-version', 'v1');
			document.documentElement.setAttribute('data-next-app', 'test-app');
			const promise = new JsSetup().init();
			promise.then(function (result) {
				expect(result).to.be.an('object');
				expect(result.flags.get).to.be.a('function');
				expect(result.mainCss.then).to.be.a('function');
				expect(result.appInfo.isProduction).to.equal(true);
				expect(result.appInfo.version).to.equal('v1');
				expect(result.appInfo.name).to.equal('test-app');
				document.documentElement.removeAttribute('data-next-is-production');
				document.documentElement.removeAttribute('data-next-version');
				document.documentElement.removeAttribute('data-next-app');
				done();
			});
		});
	});

	describe('init with flags on', function () {

		let thirdPartyStub;
		before(() => window.nextFeatureFlags = [
			'clientErrorReporting',
			'clientDetailedErrorReporting',
			'clientAjaxErrorReporting',
			'nInstrumentation'
		].map(f => {
			return {name: f, state: true};
		}));

		beforeEach(function () {
			thirdPartyStub = sinon.stub(nThirdPartyCode, 'init');
		});

		afterEach(function () {
			thirdPartyStub.restore();
		});

		after(() => delete window.nextFeatureFlags);

		it('should configure o-errors for dev', function (done) {
			const spy = sinon.spy(oErrors, 'init');
			const setup = new JsSetup();
			const promise = setup.init();
			promise.then(function () {
				expect(spy.calledOnce).to.be.true;
				expect(spy.args[0][0].enabled).to.be.false;
				spy.restore();
				done();
			})
			.catch(done);
		});

		it('should configure o-errors for prod', function (done) {
			const spy = sinon.spy(oErrors, 'init');
			document.documentElement.setAttribute('data-next-is-production', '');
			document.documentElement.setAttribute('data-next-version', 'i-am-at-version-x');
			document.documentElement.setAttribute('data-next-app', 'i-am-an-app');
			const setup = new JsSetup();
			const promise = setup.init();
			promise.then(function () {
				expect(spy.calledOnce).to.be.true;
				expect(spy.args[0][0].enabled).to.be.true;
				expect(spy.args[0][0].sentryEndpoint).to.be.a('string');
				expect(spy.args[0][0].siteVersion).to.equal('i-am-at-version-x');
				expect(spy.args[0][0].tags.appName).to.equal('i-am-an-app');
				expect(spy.args[0][0].logLevel).to.equal('contextonly');
				document.documentElement.removeAttribute('data-next-is-production');
				document.documentElement.removeAttribute('data-next-version');
				document.documentElement.removeAttribute('data-next-app');
				spy.restore();
				done();
			});
		});

		it('should return promise of flags', function (done) {
			const promise = new JsSetup().init();
			promise.then(function (result) {
				expect(result).to.be.an('object');
				expect(result.flags.get).to.be.a('function');
				done();
			});
		});
	});

	describe('bootstrap', function () {
		const result = {};
		before(() => window.nextFeatureFlags = []);


		beforeEach(function () {
			sinon.stub(JsSetup.prototype, 'init', function () {
				this.appInfo = {
					isProduction: true
				};
				return Promise.resolve(result);
			});
		});

		afterEach(function () {
			window.ftNextPolyfillLoaded = undefined;
			document.documentElement.classList.remove('js-success');
			JsSetup.prototype.init.restore();
		});

		after(() => delete window.nextFeatureFlags);

		describe('simple bootstrap', function () {
			it('should wait for dependencies to load if not yet loaded', function (done) {
				const callback = sinon.stub();
				// can't assume promises exist to do async stuff
				const p = window.Promise;
				window.Promise = undefined;
				new JsSetup().bootstrap(callback);
				setTimeout(function () {
					expect(callback.calledOnce).to.be.false;
					// now we can assume Promise is polyfilled
					window.Promise = p;
					document.dispatchEvent(new Event('ftNextPolyfillLoaded'));
					setTimeout(function () {
						expect(callback.calledOnce).to.be.true;
						expect(callback.calledWith(result)).to.be.true;
						done();
					}, 0);
				}, 0);

			});

			it('should run a callback with result of init immediately if dependencies already loaded', function (done) {
				window.ftNextPolyfillLoaded = true;
				const callback = sinon.stub();
				new JsSetup().bootstrap(callback);
				setTimeout(function () {
					expect(callback.calledOnce).to.be.true;
					expect(callback.calledWith(result)).to.be.true;
					done();
				}, 0);
			});
		});

		describe('actions carried out by bootstrap', function () {

			beforeEach(function () {
				window.ftNextPolyfillLoaded = true;
			});

			it('should pass an options object to init', function (done) {

				const callback = sinon.stub();
				const options = {};
				const jsSetup = new JsSetup()
				jsSetup.bootstrap(callback, options);
				setTimeout(function () {
					expect(jsSetup.init.calledWith(options)).to.be.true;
					done();
				}, 0);
			});

			it('should add js-success class if callback executes ok', function (done) {
				const jsSetup = new JsSetup()
				jsSetup.bootstrap(function () {});
				setTimeout(function () {
					expect(document.querySelector('html').classList.contains('js-success')).to.be.true;
					done();
				}, 0);
			});

			it('should add js-success class if callback returns resolved promise', function (done) {
				const jsSetup = new JsSetup()
				jsSetup.bootstrap(function () {
					return Promise.resolve();
				});
				setTimeout(function () {
					jsSetup.bootstrapResult.then(function () {
						expect(document.querySelector('html').classList.contains('js-success')).to.be.true;
						done();
					});
				}, 0);
			});


			describe('Error handling', function () {

				beforeEach(function () {
					sinon.stub(oErrors, 'error');
				});

				afterEach(function () {
					oErrors.error.restore();
				});

				it('should not add js-success class and log error if callback fails', function (done) {
					const jsSetup = new JsSetup()
					jsSetup.bootstrap(function () {
						throw 'error';
					});
					setTimeout(function () {
						jsSetup.bootstrapResult.then(function () {
							expect(document.querySelector('html').classList.contains('js-success')).to.be.false;
							expect(oErrors.error.called).to.be.true;
							done();
						});
					}, 0);
				});

				it('should not add js-success class and log error if callback returns rejected promise', function (done) {
					const jsSetup = new JsSetup()
					jsSetup.bootstrap(function () {
						return Promise.reject();
					});
					setTimeout(function () {
						jsSetup.bootstrapResult.then(function () {
							expect(document.querySelector('html').classList.contains('js-success')).to.be.false;
							expect(oErrors.error.called).to.be.true;
							done();
						});
					}, 0);
				});

				it('should not add js-success class if callback returns hanging promise', function (done) {
					const jsSetup = new JsSetup()
					jsSetup.bootstrap(function () {
						return new Promise(function (){});
					});
					setTimeout(function () {
						setTimeout(function () {
							expect(document.querySelector('html').classList.contains('js-success')).to.be.false;
							expect(oErrors.error.called).to.be.false;
							done();
						}, 0);
					}, 0);
				});
			});
		});
	});
});
