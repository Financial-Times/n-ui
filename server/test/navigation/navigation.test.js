const sinon = require('sinon');
const proxyquire = require('proxyquire')
	.noCallThru()
	.noPreserveCache();

describe('Navigation middleware', () => {
	let sandbox;
	let navigationModelV2Stub;
	let navigation;

	before(() => {
		sandbox = sinon.createSandbox();
		navigationModelV2Stub = {
			init: sandbox.spy(),
			middleware: sandbox.spy()
		};
		const NavigationModelV2Stub = sandbox.stub().returns(navigationModelV2Stub);
		navigation = proxyquire('../../models/navigation/index', {
			'./navigationModelV2': NavigationModelV2Stub
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should call init() on navigation model', () => {
		navigation.init();
		sinon.assert.called(navigationModelV2Stub.init);
	});

	it('Should use the V2 Model', () => {
		const req = {};
		const res = { locals: { flags: {} } };
		const next = () => {};
		navigation.init();
		navigation.middleware(req, res, next);
		sinon.assert.called(navigationModelV2Stub.middleware);
	});
});
