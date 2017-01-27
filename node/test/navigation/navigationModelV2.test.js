const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const pollerStub = require('../stubs/poller.stub');
const decorateSpy = sinon.spy(data => data);
const navigationListDataStub = require('../stubs/navigationListData.json');
const fetchMock = require('fetch-mock');

describe('NavigationModelV2', () => {

	let NavigationModel;
	const navigationDataFixture = require('../stubs/navigationv2Data.json');
	const navigationHierarchyFixture = require('../stubs/navigationHierarcyWorldUk.json');

	before(() => {
		NavigationModel = require('../../src/navigation/navigationModelV2');
	});

	context('Navigation data', () => {
		beforeEach(() => {
			fetchMock.mock(
				'http://next-navigation.ft.com/v2/menus',
				{
					body: navigationDataFixture
				},
				{
					name: 'Navigation Service V2'
				}
			)
		});

		afterEach(() => {
			fetchMock.reset();
			fetchMock.restore();
		});

		it('Should use v2 of the navigation-api for data', () => {
			const navigation = new NavigationModel();
			return navigation.init()
				.then(() => {
					expect(fetchMock.called('Navigation Service V2')).to.be.true;
				})
		});

		it('Should expose middleware to set the various menus', (done) => {
			const navigation = new NavigationModel();
			const res = {
				locals:{
					editions:{
						current:{id:'uk'}
					}
				}
			};
			const req = {
				get: sinon.stub().returns(null).withArgs('FT-Vanity-Url').returns('/world'),
				url: '/stream/sectionId/MQ==-U2VjdGlvbnM='
			};
			const expectedMenus = ['drawer', 'footer', 'navbar-simple', 'navbar-right', 'navbar', 'user', 'anon'];
			const next = () => {
				expect(Object.keys(res.locals.navigation.menus)).to.deep.equal(expectedMenus);
				done()
			};
			navigation.init()
				.then(() => {
					navigation.middleware(req, res, next);
				}).catch(done);
		});
	});

	describe('Fallback', () => {
		beforeEach(() => {
			fetchMock.mock('http://next-navigation.ft.com/v2/menus', 503)
		});

		afterEach(() => {
			fetchMock.restore();
		});

		it('Should use the hardcoded data if the service is down', (done) => {
			const navigation = new NavigationModel();
			const res = {
				locals:{
					editions:{
						current:{id:'uk'}
					}
				}
			};
			const req = {
				get: sinon.stub().returns(null).withArgs('FT-Vanity-Url').returns('/world'),
				url: '/stream/sectionId/MQ==-U2VjdGlvbnM='
			};
			const expectedMenus = ['drawer', 'navbar-simple', 'navbar'];
			const next = () => {
				expect(Object.keys(res.locals.navigation.menus)).to.deep.equal(expectedMenus);
				done()
			};
			navigation.init()
				.then(() => {
					navigation.middleware(req, res, next);
				}).catch(done);
		});
	});

	describe('Hierarchy', () => {
		beforeEach(() => {
			fetchMock.mock('http://next-navigation.ft.com/v2/menus', navigationDataFixture, {name: 'Navigation Service V2'});
			fetchMock.mock('begin:http://next-navigation.ft.com/v2/hierarchy', navigationHierarchyFixture, {name: 'Navigation Service Hierarchy'});
		});

		afterEach(() => {
			fetchMock.reset();
			fetchMock.restore();
		});


		it('Should use the v2/hierarchy endpoint to get data if hierarchy option is passed', (done) => {
			const navigation = new NavigationModel({withNavigationHierarchy:true});
			const res = {
				locals:{
					editions:{
						current:{id:'uk'}
					}
				}
			};
			const req = {
				get: sinon.stub().returns(null).withArgs('FT-Vanity-Url').returns('/world'),
				url: '/stream/sectionId/MQ==-U2VjdGlvbnM='
			};
			const next = () => {
				expect(res.locals.navigation.hierarchy).to.deep.equal(navigationHierarchyFixture);
				done()
			};
			navigation.init()
				.then(() => {
					navigation.middleware(req, res, next);
				}).catch(done);
		});
	});
});
