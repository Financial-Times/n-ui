const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('Navigation middleware', () => {

	let navigation;
	let navigationModelV2Stub = {init:sinon.spy(), middleware:sinon.spy()};

	before(() => {
		const NavigationModelV2Stub = sinon.stub().returns(navigationModelV2Stub);
		navigation = proxyquire('../../models/navigation/index', {'./navigationModelV2':NavigationModelV2Stub});
	});

	afterEach(() => {
		navigationModelV2Stub.middleware.reset();
	});

	it('Should call init() on navigation model', () => {
		navigation.init();
		sinon.assert.called(navigationModelV2Stub.init);
	});

	it('Should use the V2 Model', () => {
		const req = {};
		const res = {locals:{flags:{}}};
		const next = () => {};
		navigation.init();
		navigation.middleware(req, res, next);
		sinon.assert.called(navigationModelV2Stub.middleware);
	});
});
