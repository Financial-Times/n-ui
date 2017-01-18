/*global it, describe, beforeEach, before, after*/
const request = require('supertest');

// stub the setup api calls
const fetchMock = require('fetch-mock');
const sinon = require('sinon');
const nUi = require('../index');
const expect = require('chai').expect;
const flags = require('next-feature-flags-client');
const AWS = require('aws-sdk-mock');
const precompiledWrapper = require('fs').readFileSync(require('path').join(__dirname, './fixtures/layouts/wrapper.html.precompiled'), 'utf8');

describe.skip('layout-polling', function () {
	let app;
	let clock;
	let s3Mock;
	let s3Response;

	before(() => {

		fetchMock
			.mock(/next-flags\.ft\.com/, [{name: 'flaggy'}])
			.mock('http://ft-next-health-eu.herokuapp.com/failure-simulation-config', {failures: []})
			.catch(200);

		s3Mock = sinon.spy(function (params, callback) {
			callback(null, s3Response);
		})

		AWS.mock('S3', 'getObject', s3Mock);

		app = require('./fixtures/layout-polling/main');

		fetchMock.restore();
	});

	after(() => {
		AWS.restore('S3');
	})

	it('should not error before first poll', done => {
		expect(s3Mock.called).to.be.false
		request(app)
			.get('/')
			.expect(200, done);
	});

	it('should not error after successful poll', done => {
		s3Response = {
			Body: new Buffer(precompiledWrapper)
		};
		setTimeout(() => {
			expect(s3Mock.called).to.be.true
			request(app)
				.get('/')
				.expect(200, done);
		}, 200);
	});

	it('should not error after failed poll', () => {

	});

	it('should retrieve major version for polling from bower.json', () => {

	});

	it('should use local n-ui bower json version by default', () => {

	});

	it('should update template to reflect latest layout from S3', () => {

	});

	it('should update n-ui root url based on value retrieved from S3', () => {

	});

});
