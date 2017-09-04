/*global require,describe,afterEach,beforeEach,it,expect,sinon*/
window.nextFlags = [{name: 'aFlag', state: true}];
const JsLoader = require('../js/loader');
const nUiFoundations = require('n-ui-foundations');

describe('js loader', function () {

	it('should stub console, if applicable', function () {
		expect(window.console).to.exist;
	});

	describe('init with flags off', function () {
		before(() => window.nextFlags = []);
		after(() => delete window.nextFlags);

		it('should return promise of useful things', function (done) {
			document.documentElement.setAttribute('data-next-is-production', '');
			document.documentElement.setAttribute('data-next-version', 'v1');
			document.documentElement.setAttribute('data-next-app', 'test-app');
			const promise = new JsLoader().init();
			promise.then(function (result) {
				expect(result).to.be.an('object');
				expect(result.flags.get).to.be.a('function');
				expect(result.allStylesLoaded.then).to.be.a('function');
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

		before(() => window.nextFlags = [
			'clientErrorReporting',
			'clientDetailedErrorReporting',
			'clientAjaxErrorReporting',
			'nInstrumentation'
		].map(f => {
			return {name: f, state: true};
		}));

		after(() => delete window.nextFlags);

		it('should return promise of flags', function (done) {
			const promise = new JsLoader().init();
			promise.then(function (result) {
				expect(result).to.be.an('object');
				expect(result.flags.get).to.be.a('function');
				done();
			});
		});
	});

	describe('bootstrap', function () {
		const result = {};
		before(() => window.nextFlags = []);

		beforeEach(function () {
			sinon.stub(JsLoader.prototype, 'init', function () {
				this.appInfo = {
					isProduction: true
				};
				return Promise.resolve(result);
			});
		});

		afterEach(function () {
			window.ftNextPolyfillLoaded = undefined;
			document.documentElement.classList.remove('js-success');
			JsLoader.prototype.init.restore();
		});

		after(() => delete window.nextFlags);

		describe('simple bootstrap', function () {

			it('should run a callback with result of init immediately', function (done) {
				window.ftNextPolyfillLoaded = true;
				const callback = sinon.stub();
				new JsLoader().bootstrap({}, callback);
				setTimeout(function () {
					expect(callback.calledOnce).to.be.true;
					expect(callback.calledWith(result)).to.be.true;
					done();
				}, 100);
			});
		});

		describe('actions carried out by bootstrap', function () {

			beforeEach(function () {
				window.ftNextPolyfillLoaded = true;
			});

			it('should add js-success class if callback executes ok', function (done) {
				const jsLoader = new JsLoader();
				jsLoader.bootstrap({}, function () {});
				setTimeout(function () {
					expect(document.querySelector('html').classList.contains('js-success')).to.be.true;
					done();
				}, 100);
			});

			it('should add js-success class if callback returns resolved promise', function (done) {
				const jsLoader = new JsLoader();
				jsLoader.bootstrap({}, function () {
					return Promise.resolve();
				});
				setTimeout(function () {
					jsLoader.bootstrapResult.then(function () {
						expect(document.querySelector('html').classList.contains('js-success')).to.be.true;
						done();
					});
				}, 100);
			});

			it('should not carry out success actions if a preload', function (done) {
				const jsLoader = new JsLoader();
				jsLoader.bootstrap({preload: true}, function () {});
				setTimeout(function () {
					expect(document.querySelector('html').classList.contains('js-success')).to.be.false;
					done();
				}, 100);
			});


			describe('Error handling', function () {

				beforeEach(function () {
					sinon.stub(nUiFoundations, 'broadcast');
				});

				afterEach(function () {
					nUiFoundations.broadcast.restore();
				});

				it('should not add js-success class and log error if callback fails', function (done) {
					const jsLoader = new JsLoader();
					jsLoader.bootstrap({}, function () {
						throw 'error';
					});
					setTimeout(function () {
						jsLoader.bootstrapResult.then(function () {
							expect(document.querySelector('html').classList.contains('js-success')).to.be.false;
							expect(nUiFoundations.broadcast.calledWith('oErrors.log')).to.be.true;
							done();
						});
					}, 100);
				});

				it('should not add js-success class and log error if callback returns rejected promise', function (done) {
					const jsLoader = new JsLoader();
					jsLoader.bootstrap({}, function () {
						return Promise.reject();
					});
					setTimeout(function () {
						jsLoader.bootstrapResult.then(function () {
							expect(document.querySelector('html').classList.contains('js-success')).to.be.false;
							expect(nUiFoundations.broadcast.calledWith('oErrors.log')).to.be.true;
							done();
						});
					}, 100);
				});

				it('should not add js-success class if callback returns hanging promise', function (done) {
					const jsLoader = new JsLoader();
					jsLoader.bootstrap({}, function () {
						return new Promise(function (){});
					});
					setTimeout(function () {
						setTimeout(function () {
							expect(document.querySelector('html').classList.contains('js-success')).to.be.false;
							expect(nUiFoundations.broadcast.calledWith('oErrors.log')).to.be.false;
							done();
						}, 100);
					}, 100);
				});
			});
		});
	});
});
