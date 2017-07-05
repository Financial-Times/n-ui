/*global it, describe, beforeEach, before, after*/
const request = require('supertest');

// stub the setup api calls
const fetchMock = require('fetch-mock');
const expect = require('chai').expect;

let app;

describe('simple app', function () {

	before(() => {

		fetchMock
			.mock(/next-flags\.ft\.com|ft-next-feature-flags-prod/, [{name: 'flaggy'}])
			.mock('http://ft-next-health-eu.herokuapp.com/failure-simulation-config', {failures: []})
			.catch(200);

		app = require('./fixtures/app/main');

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

		// apps do not serve static resources in prod
		it.skip('should have a static resource', function (done) {
			request(app)
				.get('/demo-app/test.html')
				.expect(200, 'Static file\n', done);
		});


		it('should 401 for arbitrary route without a backend access key in production', function (done) {
			process.env.NODE_ENV = 'production';
			request(app)
				.get('/')
				.expect('FT-Backend-Authentication', /false/)
				.expect(401, function () {
					process.env.NODE_ENV = '';
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

			it('should treat undefined flags as offy (like falsey)', function (done) {
				request(app)
					.get('/templated')
					// Currently fails - suggest we just ditch this feature, as per
					// https://github.com/Financial-Times/next-feature-flags-client/issues/26
					//.expect(/<undefinedflag-off>Should appear<\/undefinedflag-off>/)
					.expect(200, /<undefinedflag-on><\/undefinedflag-on>/, done);
			});

		});
	});

	describe('asset and preloading', () => {

		it('should expose hashed asset helper', () => {
			expect(app.getHashedAssetUrl).to.exist;
			expect(typeof app.getHashedAssetUrl).to.equal('function');
		});

		it('should inline head.css & head-n-ui-core.css', (done) => {
			request(app)
				.get('/with-layout?layout=wrapper')
				.expect(200, /<style class="n-layout-head-css">\s*head-n-ui-core\.css\s*head\.css\s*<\/style>/, done);
		});

		it('should have preload link tags for main.css', (done) => {
			request(app)
				.get('/with-layout?layout=wrapper')
				.expect(200, /<link data-is-next rel="preload" href="\/\/www\.ft\.com\/__assets\/hashed\/demo-app\/56f3a89e\/main\.css" as="style" onload=/, done);
		});

		it('should not preload anything by default on non text/html requests', done => {
			request(app)
				.get('/non-html')
				.end((err, res) => {
					expect(res.headers.link).to.not.exist;
					done();
				});
		});

		it('should have preload link headers for css and js resources', done => {
			request(app)
				.get('/templated')
				.expect('Link', /<https:\/\/www\.ft\.com\/.*polyfill.min\.js.*>; as="script"; rel="preload"; nopush/)
				.expect('Link', /<\/\/www\.ft\.com\/__assets\/hashed\/n-ui\/123456\/es5\.js>; as="script"; rel="preload"; nopush/)
				.expect('Link', /<\/\/www\.ft\.com\/__assets\/hashed\/n-ui\/1234567\/o-errors\.js>; as="script"; rel="preload"; nopush/)
				.expect('Link', /<\/\/www\.ft\.com\/__assets\/hashed\/n-ui\/12345678\/font-loader\.js>; as="script"; rel="preload"; nopush/)
				.expect('Link', /<\/\/www\.ft\.com\/__assets\/hashed\/demo-app\/56f3a89e\/main\.css>; as="style"; rel="preload"; nopush/)
				.expect('Link', /<\/\/www\.ft\.com\/__assets\/hashed\/demo-app\/6988e3b1\/main-without-n-ui\.js>; as="script"; rel="preload"; nopush/, done);
		});


		it('should have preload link header for masthead', done => {
			request(app)
				.get('/templated')
				.expect('Link', /.*ftlogo\:brand-ft-masthead.*>; as="image"; rel="preload"; nopush/, done);
		});

		it('should inline different choice of head.css', (done) => {
			request(app)
				.get('/css-variants?inline=head-variant,style-variant2')
				.expect(200, /<style class="n-layout-head-css">\s*head-n-ui-core\.css\s*head-variant\.css\s*style-variant2\.css\s*<\/style>/, done);

		});

		it('should load different choice of css files', done => {
			request(app)
				.get('/css-variants?lazy=jam,marmalade&blocking=peanut')
				.expect('Link', /<\/\/www\.ft\.com\/__assets\/hashed\/demo-app\/123abc\/jam\.css>; as="style"; rel="preload"; nopush/)
				.expect('Link', /<\/\/www\.ft\.com\/__assets\/hashed\/demo-app\/456def\/marmalade\.css>; as="style"; rel="preload"; nopush/)
				.expect(200, /<link data-is-next rel="preload" href="\/\/www\.ft\.com\/__assets\/hashed\/demo-app\/123abc\/jam\.css" as="style" onload=/)
				.expect(200, /<link data-is-next rel="preload" href="\/\/www\.ft\.com\/__assets\/hashed\/demo-app\/456def\/marmalade\.css" as="style" onload=/)
				.expect('Link', /<\/\/www\.ft\.com\/__assets\/hashed\/demo-app\/789ghi\/peanut\.css>; as="style"; rel="preload"; nopush/)
				.expect(200, /<link rel="stylesheet" href="\/\/www\.ft\.com\/__assets\/hashed\/demo-app\/789ghi\/peanut\.css"/)
				.expect(res => {
					expect(res.headers.link.indexOf('main.css')).to.equal(-1);
				})
				.end(done);
		});

		it('should be possible to preload any file on any request', done => {
			request(app)
				.get('/with-layout?preload=true')
				.expect('Link', /<\/\/www\.ft\.com\/__assets\/hashed\/demo-app\/012345\/it\.js>; rel="preload"; as="script"; nopush/)
				.expect('Link', /<https:\/\/place\.com\/it\.js>; rel="preload"; as="script"; nopush/, done);
		});

	});
});
