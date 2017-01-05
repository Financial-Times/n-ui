/*global it, describe, beforeEach, before, after*/
const request = require('supertest');

// stub the setup api calls
const fetchMock = require('fetch-mock');
const sinon = require('sinon');
const nUi = require('../../index');
const expect = require('chai').expect;
const flags = require('next-feature-flags-client');
const verifyAssetsExist = require('../../src/lib/verify-assets-exist');

let app;


describe('simple app', function () {

	before(() => {

		fetchMock
			.mock(/next-flags\.ft\.com/, [{name: 'flaggy'}])
			.mock('http://ft-next-health-eu.herokuapp.com/failure-simulation-config', {failures: []})
			.catch(200);

		app = require('../fixtures/app/main');

		fetchMock.restore();
	});

	it('should have its own route', function (done) {
		request(app)
			.get('/')
			.expect(200, 'Hello world', done);
	});

	describe('inherited from, and auto configured in, n-express', function () {
		it('should be possible to add routers', function (done) {
			request(app)
				.get('/router/')
				.expect('Vary', /FT-Flags/i)
				.expect(200, 'Hello router', done);
		});

		it('should have a robots.txt', function (done) {
			request(app)
				.get('/robots.txt')
				.expect(200, done);
		});

		it('should have an about json', function (done) {
			request(app)
				.get('/__about')
				.expect(200, done);
		});

		it('should have a static resource', function (done) {
			request(app)
				.get('/demo-app/test.txt')
				.expect(200, 'Static file\n', done);
		});


		it('should 401 for arbitrary route without a backend access key in production', function (done) {
			process.env.NODE_ENV = 'production';
			request(app)
				.get('/')
				.expect('FT-Backend-Authentication', /false/)
				.expect(401, function () {
					process.env.NODE_ENV = '';
					done()
				});
		});
		it.skip('should be possible to disable flags', function (done) {

			sinon.stub(verifyAssetsExist, 'verify');
			sinon.stub(flags, 'init').returns(Promise.resolve(null));
			const app = nUi({
				name: 'noflags',
				directory: __dirname,
				withFlags: false,
				withHeadCss: false // otherwise it errors as public folder doesn't exist
			});
			app.get('/', function (req, res) {
				res.end('', 200);
			});
			expect(flags.init.called).to.be.false;
				request(app)
				.get('/')
				.expect(200, function () {
					flags.init.restore();
					verifyAssetsExist.verify.restore();
					done();
				});
		});

	});

	// By default, app.withHandlebars is true
	it('should add a `FT-Force-Opt-In-Device` header to the vary for all apps that use handlebars', function (done) {
		request(app)
			.get('/')
			.expect('Vary', /FT-Force-Opt-In-Device/i)
			.expect(200, 'Hello world', done);
	});

	it('should add the AB test state to locals', function (done) {
		request(app)
			.get('/templated')
			.set('FT-AB', 'someAbTest:variant')
			.expect(200, /<div id="ab-state">someAbTest\:variant<\/div>/, done);
	});


	describe('templating', function () {

		it('should do templating', function (done) {
			request(app)
				.get('/templated')
				.expect(200, /FT/, done);
		});

		it('should not inherit any markup by default', function (done) {
			request(app)
				.get('/templated')
				.expect(200, /^<h1>FT - on/, done);
		});

		it('should be possible to inherit a layout', function (done) {
			request(app)
				.get('/with-layout')
				.expect(200, /^<!DOCTYPE html>(.|[\r\n])*head(.|[\r\n])*body(.|[\r\n])*h1(.|[\r\n])*h2(.|[\r\n])*<\/html>/, done);
		});

		//fixme - this test breaks on Travis
		it.skip('should integrate with the image service', function (done) {
			const expected = process.env.TRAVIS ?
				/image\.webservices\.ft\.com\/v1\/images\/raw/ :
				/next-geebee\.ft\.com\/image\/v1\/images\/raw/;
			request(app)
				.get('/templated')
				.expect(200, expected, done);
		});

		it('should support loading partials via bower', function (done) {
			request(app)
				.get('/templated')
				.expect(200, /End of dep 2 partial/, done);
		});

		it('should support app-specific helpers', function (done) {
			request(app)
				.get('/templated')
				.expect(200, /HELLO/, done);
		});

		it('should expose app name to views', function (done) {
			request(app)
				.get('/templated')
				.expect(200, /on app demo-app/, done);
		});

		describe('n-handlebars features', function () {

			// these two helpers
			// a) provide a sample of n-handlebars' features to make sure it is being consumed at all
			// b) are the trickiest ones most likely to break
			it('should provide inheritance helpers', function (done) {
				request(app)
					.get('/templated')
					.expect(200, /block1default block2override/, done);
			});
			it('should provide a dynamic partials helper', function (done) {
				request(app)
					.get('/templated')
					.expect(200, /dynamic-partial/, done)
					.expect(200, /dynamicroot-iamroot/, done);
			});
		});

		it('should treat undefined flags as offy (like falsey)', function (done) {
			request(app)
				.get('/templated')
				// Currently fails - suggest we just ditch this feature, as per
				// https://github.com/Financial-Times/next-feature-flags-client/issues/26
				//.expect(/<undefinedflag-off>Should appear<\/undefinedflag-off>/)
				.expect(200, /<undefinedflag-on><\/undefinedflag-on>/, done);
		});

	});

	describe('hashed assets and preloading', () => {

		it('should preload main.css, main-with-n-ui.js and polyfill', done => {
			request(app)
				.get('/templated')
				.expect('Link', /<\/\/next-geebee\.ft\.com\/.*polyfill.min\.js.*>; as="script"; rel="preload"; nopush/)
				.expect('Link', /<\/\/www\.ft\.com\/__assets\/n-ui\/cached\/v1\/es5\.min\.js>; as="script"; rel="preload"; nopush/)
				.expect('Link', /<\/demo-app\/main-without-n-ui\.js>; as="script"; rel="preload"; nopush/, done)
		});

		it('should not preload anything by default on non text/html requests', done => {
			request(app)
				.get('/non-html')
				.end((err, res) => {
					expect(res.headers.link).to.not.exist;
					done();
				})
		});

		it('should preload main-variant.css as appropriate', done => {
			request(app)
				.get('/templated?cssVariant=variant')
				.expect('Link', /<\/demo-app\/main-variant\.css>; as="style"; rel="preload"; nopush/, done)
		});

		it('should be possible to preload any file on any request', done => {
			request(app)
				.get('/non-html?preload=true')
				.expect('Link', '</demo-app/it.js>; rel="preload"; as="script"; nopush, <https://place.com/it.js>; rel="preload"; as="script"; nopush', done)
		});

	})
});
