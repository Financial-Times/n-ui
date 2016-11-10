/* globals sinon */
import subscriptionOfferPrompt from '../index';
import * as lionel from '../lionel';
import * as election from '../us-elections';
import * as president from '../hillary-trump';

describe('Subscription Offer Prompt Init', () => {

	let lionelStub;
	let electionStub;
	let presidentStub;
	let flags;

	beforeEach(() => {
		Object.defineProperty(document, 'cookie', { value: '', configurable: true });
		lionelStub = sinon.spy(lionel, 'init');
		electionStub = sinon.spy(election, 'init');
		presidentStub = sinon.spy(president, 'init');
		// stub out the flag.get(b2cMessagePrompt) = true
		flags = { get: (val) => val === 'b2cMessagePrompt' }
	});

	afterEach(() => {
		delete document.cookie;
		lionelStub.restore();
		electionStub.restore();
		presidentStub.restore();
		flags = null;
	});

	it('should not init any prompt if on barrier pages', () => {
		const barrier = document.createElement('div');
		barrier.className = 'ft-subscription-panel';
		document.body.appendChild(barrier);

		subscriptionOfferPrompt(flags);
		lionelStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;
		presidentStub.should.not.have.been.called;

		document.body.removeChild(barrier);
	});

	it('should not init any prompt if logged in', () => {
		Object.defineProperty(document, 'cookie', { value: 'FTSession=foo', configurable: true });

		subscriptionOfferPrompt(flags);
		lionelStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;
		presidentStub.should.not.have.been.called;
	});

	it('should not init any prompt if b2cMessagePrompt flag is false', () => {
		// stub out the flag.get(b2cMessagePrompt) = false
		flags = { get: (val) => { if(val === 'b2cMessagePrompt') return false } }

		subscriptionOfferPrompt(flags);
		lionelStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;
		presidentStub.should.not.have.been.called;
	});

	it('should init "Lionel slider" if NOT logged in & NOT on barrier page & NOT on /us-election-2016 page', () => {
		subscriptionOfferPrompt(flags);
		lionelStub.should.have.callCount(1);

		electionStub.should.have.not.been.called;
		presidentStub.should.not.have.been.called;
	});

	it('should init "2016 US Election slider" if NOT logged in & on /us-election-2016 stream page', () => {
		document.documentElement.setAttribute('data-concept-id', 'N2UxNTM3MzItNWNlZC00MDc5LWI3ODUtYWNmZDA2YjE0MWE2-U2VjdGlvbnM=')
		subscriptionOfferPrompt(flags);
		electionStub.should.have.callCount(1);

		lionelStub.should.not.have.been.called;
		presidentStub.should.not.have.been.called;
		document.documentElement.removeAttribute('data-concept-id');
	});

	it('should init "President Elect slider" if NOT logged & NOT on barrier page & "hillaryWinsOffer" flag is truthy', () => {
		// stub out the flag.get(b2cMessagePrompt) = true
		flags = { get: (val) => {
			if (val === 'b2cMessagePrompt') return true;
			if (val === 'trumpWinsTest') return false;
			if (val === 'trumpWinsOffer') return false;
			if (val === 'hillaryWinsOffer') return true;
		}}

		subscriptionOfferPrompt(flags);
		presidentStub.should.have.callCount(1);

		lionelStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;
	});

	it('should init "President Elect slider" if NOT logged & NOT on barrier page & "trumpWinsTest" flag is truthy && "trumpWinsOffer" is truthy', () => {
		// stub out the flag.get(b2cMessagePrompt) = true
		flags = { get: (val) => {
			if (val === 'b2cMessagePrompt') return true;
			if (val === 'trumpWinsTest') return true;
			if (val === 'trumpWinsOffer') return true;
			if (val === 'hillaryWinsOffer') return false;
		}}

		subscriptionOfferPrompt(flags);
		presidentStub.should.have.callCount(1);

		lionelStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;
	});

	it('should init "President Elect slider" if NOT logged & NOT on barrier page & "trumpWinsTest" flag is truthy', () => {
		// stub out the flag.get(b2cMessagePrompt) = true
		flags = { get: (val) => {
			if (val === 'b2cMessagePrompt') return true;
			if (val === 'trumpWinsTest') return true;
			if (val === 'trumpWinsOffer') return false;
			if (val === 'hillaryWinsOffer') return false;
		}}

		subscriptionOfferPrompt(flags);
		presidentStub.should.have.callCount(1);

		lionelStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;
	});

	it('should init "President Elect slider" if NOT logged & NOT on barrier page &  "trumpWinsOffer" is truthy', () => {
		// stub out the flag.get(b2cMessagePrompt) = true
		flags = { get: (val) => {
			if (val === 'b2cMessagePrompt') return true;
			if (val === 'trumpWinsTest') return false;
			if (val === 'trumpWinsOffer') return true;
			if (val === 'hillaryWinsOffer') return false;
		}}

		subscriptionOfferPrompt(flags);
		presidentStub.should.have.callCount(1);

		lionelStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;
	});

	it('should NOT init "President Elect slider" if NOT logged in & NOT on barrier page & "trumpWinsTest" flag is falsey and "trumpWinsOffer" is falsey', () => {
		// stub out the flag.get(b2cMessagePrompt) = true
		flags = { get: (val) => {
			if (val === 'b2cMessagePrompt') return true;
			if (val === 'trumpWinsTest') return false;
			if (val === 'trumpWinsOffer') return false;
			if (val === 'hillaryWinsOffer') return false;
		}}

		subscriptionOfferPrompt(flags);
		presidentStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;

		lionelStub.should.have.callCount(1);
	});

	it('should NOT init "President Elect slider" if NOT logged & NOT on barrier page & "trumpWinsTest" flag is "trial_only"', () => {
		// stub out the flag.get(b2cMessagePrompt) = true
		flags = { get: (val) => {
			if (val === 'b2cMessagePrompt') return true;
			if (val === 'trumpWinsTest') return 'trial_only';
			if (val === 'trumpWinsOffer') return true;
			if (val === 'hillaryWinsOffer') return false;
		}}

		subscriptionOfferPrompt(flags);
		presidentStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;

		lionelStub.should.have.callCount(1);
	});

});
