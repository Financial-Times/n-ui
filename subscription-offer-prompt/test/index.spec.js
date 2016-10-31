/* globals sinon */
import subscriptionOfferPrompt from '../index';
import * as lionel from '../lionel';
import * as election from '../us-elections';

describe('Subscription Offer Prompt Init', () => {

	let lionelStub;
	let electionStub;
	let flags;

	beforeEach(() => {
		Object.defineProperty(document, 'cookie', { value: '', configurable: true });
		lionelStub = sinon.spy(lionel, 'init');
		electionStub = sinon.spy(election, 'init');
		// stub out the flag.get()
		flags = { get: () => true }
	});

	afterEach(() => {
		delete document.cookie;
		lionelStub.restore();
		electionStub.restore();
		flags = null;
	});

	it('should not init either prompt if on barrier pages', () => {
		const barrier = document.createElement('div');
		barrier.className = 'ft-subscription-panel';
		document.body.appendChild(barrier);

		subscriptionOfferPrompt(flags);
		lionelStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;

		document.body.removeChild(barrier);
	});

	it('should not init either prompt if logged in', () => {
		Object.defineProperty(document, 'cookie', { value: 'FTSession=foo', configurable: true });

		subscriptionOfferPrompt(flags);
		lionelStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;
	});

	it('should not init either prompt if b2cMessagePrompt flag is false', () => {
		flags.get = () => false;

		subscriptionOfferPrompt(flags);
		lionelStub.should.not.have.been.called;
		electionStub.should.not.have.been.called;
	});

	it('should init "Lionel slider" if NOT logged in & NOT on barrier page & NOT on /us-election-2016 page', () => {
		subscriptionOfferPrompt(flags);
		lionelStub.should.have.callCount(1);
		electionStub.should.have.not.been.called;
	});

	it('should init "2016 US Election slider" if NOT logged in & on /us-election-2016 stream page', () => {
		document.documentElement.setAttribute('data-concept-id', 'N2UxNTM3MzItNWNlZC00MDc5LWI3ODUtYWNmZDA2YjE0MWE2-U2VjdGlvbnM=')
		subscriptionOfferPrompt(flags);
		electionStub.should.have.callCount(1);
		document.documentElement.removeAttribute('data-concept-id');
	});

});
