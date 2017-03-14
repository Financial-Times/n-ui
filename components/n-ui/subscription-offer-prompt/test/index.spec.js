/* globals sinon */
import subscriptionOfferPrompt from '../index';
import * as lionel from '../lionel';
import api from '../countryApi';

sinon.stub(api, 'getCountryCode', function () {
	return 'GBR';
})

describe('Subscription Offer Prompt Init', () => {

	let lionelStub;
	let flags;

	beforeEach(() => {
		Object.defineProperty(document, 'cookie', { value: '', configurable: true });
		lionelStub = sinon.spy(lionel, 'init');
		// stub out the flag.get(b2cMessagePrompt) = true
		flags = { get: (val) => val === 'b2cMessagePrompt' };
	});


	afterEach(() => {
		delete document.cookie;
		lionelStub.restore();
		flags = null;
	});

	it('should not init any prompt if on barrier pages', () => {
		const barrier = document.createElement('div');
		barrier.className = 'ft-subscription-panel';
		document.body.appendChild(barrier);

		subscriptionOfferPrompt(flags);
		lionelStub.should.not.have.been.called;
		document.body.removeChild(barrier);
	});

	it('should not init any prompt if logged in', () => {
		Object.defineProperty(document, 'cookie', { value: 'FTSession=foo', configurable: true });

		subscriptionOfferPrompt(flags);
		lionelStub.should.not.have.been.called;
	});

	it('should not init any prompt if b2cMessagePrompt flag is false', () => {
		// stub out the flag.get(b2cMessagePrompt) = false
		flags = { get: (val) => { if(val === 'b2cMessagePrompt') return false } }

		subscriptionOfferPrompt(flags);
		lionelStub.should.not.have.been.called;
	});

	it('should init "Lionel slider" if NOT logged in & NOT on barrier page & NOT on /us-election-2016 page', () => {
		subscriptionOfferPrompt(flags);
		lionelStub.should.have.callCount(1);

	});

});
