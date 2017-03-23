const expect = require('chai').expect;
const sinon = require('sinon');

describe('Welcome Banner Model', () => {

	let subject;

	before(() => {
		subject = require('../models/welcome-banner');
	});

	const wait = t => new Promise(r => setTimeout(r, t));

	it('Should provide the no welcome banner by default', () => {
		const res = {locals:{flags:{}}};
		const req = {path:'/', get: () => ''};
		const next = sinon.spy();
		subject(req, res, next);
		return wait(0).then(() => {
			sinon.assert.called(next);
			expect(res.locals).to.not.have.property('welcomeBanner');
		});
	});

	it('Should not provide the welcome banner if the user is anonymous', () => {
		const res = {locals:{anon:{userIsAnonymous: true},flags:{compactView:true}}};
		const req = {path:'/', get: () => 'standard'};
		const next = sinon.spy();
		subject(req, res, next);
		return wait(0).then(() => {
			sinon.assert.called(next);
			expect(res.locals).to.not.have.property('welcomeBanner');
		});
	});

	it('Should provide the compact advert view model if the compactView flag is on AND we are on the homepage AND the user is not anonymous', () => {
		const res = {locals:{anon:{userIsAnonymous: false},flags:{compactView:true}}};
		const req = {path:'/', get: () => 'standard'};
		const next = sinon.spy();
		subject(req, res, next);
		return wait(0).then(() => {
			sinon.assert.called(next);
			expect(res.locals).to.have.property('welcomeBanner');
			expect(res.locals.welcomeBanner).to.deep.equal(subject._banners.compactAdvertWelcomeBannerModel);
		});
	});

	it('Should provide the compact enabled view model if the compactView flag is on AND we are on the homepage AND the user is not anonymous AND the FT-Cookie-ft-homepage-view IS set to "compact"', () => {
		const res = {locals:{anon:{userIsAnonymous: false},flags:{compactView:true}}};
		const req = {path:'/', get: () => 'compact'};
		const next = sinon.spy();
		subject(req, res, next);
		return wait(0).then(() => {
			sinon.assert.called(next);
			expect(res.locals).to.have.property('welcomeBanner');
			expect(res.locals.welcomeBanner).to.deep.equal(subject._banners.compactViewEnabledWelcomeBannerModel);
		});
	});

});
