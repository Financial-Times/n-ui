/*global require,describe,it,expect*/

const cookieStore = require('../js/cookies');

describe('Cookie Utils', () => {

	const testCookieName = 'testCookie';
	const testCookieValue = 'test';

	afterEach(() => {
		cookieStore.remove(testCookieName);
	});

	it('Should be able to set a cookie value', () => {
		cookieStore.set(testCookieName, testCookieValue, {maxAge:1000});
		let cookie = document.cookie.replace(cookieStore.getRegexForName(testCookieName), '$1');
		expect(cookie).to.equal(testCookieValue);
	});

	it('Should be able to get a cookie value', () => {
		cookieStore.set(testCookieName, testCookieValue, {maxAge:1000});
		const value = cookieStore.get(testCookieName);
		expect(value).to.equal(testCookieValue);
	});

	it('Should be able to test for the existence of a cookie', () => {
		cookieStore.set(testCookieName, testCookieValue, {maxAge:1000});
		const result = cookieStore.has(testCookieName);
		expect(result).to.be.true;
	});

	it('Should be able to delete a cookie by setting the expiry to the past', () => {
		cookieStore.set(testCookieName, testCookieValue, {maxAge:1000});
		cookieStore.remove(testCookieName);
		expect(cookieStore.has(testCookieName)).to.be.false;
	});

	it('Should url encode (and unencode) names and values', () => {
		const name = '&name';
		const value = 'val:ue';
		cookieStore.set(name, value);
		expect(cookieStore.has(name)).to.be.true;
		expect(cookieStore.get(name)).to.equal(value);
	});

	context('User', () => {

		before(() => {
			cookieStore.set('FT_User', 'USERID=4011624548:EMAIL=paul.i.wilson@ft.com:FNAME=Paul:LNAME=Wilson:TIME=%5BTue%2C+10-Jan-2017+14%3A22%3A14+GMT%5D:USERNAME=paul.i.wilson@ft.com:REMEMBER=_REMEMBER_:ERIGHTSID=11624548:PRODUCTS=_Tools_S1_P0_P2_:RESOURCES=:GROUPS=:X=');
		});

		it('Should be able to get a user\'s products', () => {
			const user = cookieStore.user();
			const products = user.products();
			expect(products).to.equal('_Tools_S1_P0_P2_')
		})
	})
});
