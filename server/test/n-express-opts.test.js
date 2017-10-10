/*global it, describe*/
const nUi = require('../index');
const nExpress = require('@financial-times/n-express');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('configuring n-express', () => {
	it('should turn things on by default in n-express', () => {
		sinon.stub(nExpress, 'getAppContainer', () => ({app: {
			locals: {},
			use: () => null
		}, meta: {}, addInitPromise: () => null}));
		nUi({
			withAssets: false,
			withHandlebars: false
		});
		const nExpressOpts = nExpress.getAppContainer.args[0][0];
		expect(nExpressOpts.withBackendAuthentication).to.be.true;
		expect(nExpressOpts.withServiceMetrics).to.be.true;
		expect(nExpressOpts.withFlags).to.be.true;
		nExpress.getAppContainer.restore();
	});

	it('should be possible to turn things off in n-express', () => {
		sinon.stub(nExpress, 'getAppContainer', () => ({app: {
			locals: {},
			use: () => null
		}, meta: {}, addInitPromise: () => null}));
		nUi({
			withAssets: false,
			withHandlebars: false,
			withBackendAuthentication: false,
			withServiceMetrics: false
		});
		const nExpressOpts = nExpress.getAppContainer.args[0][0];
		expect(nExpressOpts.withBackendAuthentication).to.be.false;
		expect(nExpressOpts.withServiceMetrics).to.be.false;
		nExpress.getAppContainer.restore();
	});

	it('should pass healthchecks to n-express', () => {
		sinon.stub(nExpress, 'getAppContainer', () => ({app: {
			locals: {},
			use: () => null
		}, meta: {}, addInitPromise: () => null}));
		const hc = [];
		nUi({
			withAssets: false,
			withHandlebars: false,
			healthChecks: hc
		});
		const nExpressOpts = nExpress.getAppContainer.args[0][0];
		expect(nExpressOpts.healthChecks).to.equal(hc);
		nExpress.getAppContainer.restore();
	});
});
