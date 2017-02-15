const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('Navigation middleware', () => {

	let navigation;
	let navigationModelV1Stub = {init:sinon.spy(), middleware:sinon.spy()};
	let navigationModelV2Stub = {init:sinon.spy(), middleware:sinon.spy()};

	before(() => {
		const NavigationModelV1Stub = sinon.stub().returns(navigationModelV1Stub);
		const NavigationModelV2Stub = sinon.stub().returns(navigationModelV2Stub);
		navigation = proxyquire('../../models/navigation/index', {'./navigationModelV1':NavigationModelV1Stub, './navigationModelV2':NavigationModelV2Stub});
	});

	afterEach(() => {
		navigationModelV1Stub.middleware.reset();
		navigationModelV2Stub.middleware.reset();
	});

	it('Should call init() on both models', () => {
		navigation.init();
		sinon.assert.called(navigationModelV2Stub.init);
		sinon.assert.called(navigationModelV1Stub.init);
	});

	it('Should use the V2 Model', () => {
		const req = {};
		const res = {locals:{flags:{}}};
		const next = () => {};
		navigation.init();
		navigation.middleware(req, res, next);
		sinon.assert.called(navigationModelV2Stub.middleware);
		sinon.assert.notCalled(navigationModelV1Stub.middleware);
	});
});
