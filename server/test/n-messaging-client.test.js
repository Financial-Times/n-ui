/*global describe, it, beforeEach*/
const request = require('supertest');
const nextExpress = require('../index');
const expect = require('chai').expect;

describe('n-messaging-client Middleware', function () {
	let app;
	let locals;

	context('enabled (via config)', function () {
		before(function () {
			app = nextExpress({ withFlags:true, withHandlebars:false, withAssets: false, withMessaging: true, systemCode: 'n-messaging-client'});
			app.get('/', function (req, res) {
				locals = res.locals;
				res.sendStatus(200).end();
			});
		});

		it('Should set the res.locals.__withMessaging property', function (done) {
			request(app)
				.get('/')
				.expect(function () {
					expect(locals).to.have.own.property('__withMessaging');
					expect(locals.__withMessaging).to.be.true;
				})
				.end(done);
		});
	});

	context('default (disabled)', function () {

		before(function () {
			app = nextExpress({ withFlags:true, withHandlebars:false, withAssets: false, systemCode: 'n-messaging-client'});
			app.get('/', function (req, res) {
				locals = res.locals;
				res.sendStatus(200).end();
			});
		});

		it('Should set the res.locals.__withMessaging property', function (done) {
			request(app)
				.get('/')
				.expect(function () {
					expect(locals).to.not.have.own.property('__withMessaging');
				})
				.end(done);
		});

	});

});
