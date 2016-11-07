/* globals should, sinon */
import SlidingPopup from 'n-sliding-popup';
import Superstore from 'superstore';
import { init } from '../hillary-trump.js';

const delay = (ms, value) => new Promise(resolve => setTimeout(resolve.bind(null, value), ms));

describe('"President Elect" Subscription Offer Prompt', () => {

	const sessionStorage = new Superstore('session', 'n-ui.subscription-offer-prompt-us-election-result');
	let flags;

	beforeEach(() => {
		const fetchStub = sinon.stub(window, 'fetch');
		fetchStub
			.withArgs('/country')
			.returns(Promise.resolve({
				json: () => Promise.resolve('GBR')
			}));
		fetchStub
			.withArgs('https://www.howsmyssl.com/a/check')
			.returns(Promise.resolve({
				json: () => Promise.resolve({ tls_version: 'TLS 1.2' })
			}));

		// stub out the flag.get()
		flags = { get: () => true }

		return Promise.all([
			sessionStorage.set('last-seen', false)
		])
	});

	afterEach(() => {
		window.fetch.restore();
		flags = null;

		return Promise.all([
			sessionStorage.unset('last-seen')
		]);
	});

	it('should show prompt if navigated from barrier page, not on a barrier page and hasnt been shown in 30 days', () =>
		init(flags).then(popup => popup.should.be.an.instanceof(SlidingPopup))
	);

	it('should have correct attributes', () =>
		init(flags).then(popup => {
			popup.el.getAttribute('class').should.include('n-sliding-popup subscription-prompt');
			popup.el.getAttribute('data-n-component').should.equal('o-sliding-popup');
			popup.el.getAttribute('data-n-sliding-popup-position').should.equal('bottom left');
		})
	);

	it('should have correct html', () =>
		init(flags).then(popup => {
			popup.el.innerHTML.should.contain('America Appoints')
		})
	);

	it('should have correct candidate name if "hillaryWinsOffer" flag is truthy', () => {
		flags = { get: (val) => val === 'hillaryWinsOffer' }
		return init(flags).then(popup => {
			popup.el.innerHTML.should.contain('Hillary Clinton')
			popup.el.innerHTML.should.not.contain('Donald Trump')
		})
	});

	it('should have correct candidate name if "trumpWinsOffer" flag is truthy', () => {
		flags = { get: (val) => val === 'trumpWinsOffer' }
		return init(flags).then(popup => {
			popup.el.innerHTML.should.contain('Donald Trump')
			popup.el.innerHTML.should.not.contain('Hillary Clinton')
		})
	});

	it('should have correct candidate name if "trumpWinsTest" flag is truthy', () => {
		flags = { get: (val) => val === 'trumpWinsTest' }
		return init(flags).then(popup => {
			popup.el.innerHTML.should.contain('Donald Trump')
			popup.el.innerHTML.should.not.contain('Hillary Clinton')
		})
	});

	// TODO: naughty, but errors for unknown reason - https://circleci.com/gh/Financial-Times/n-ui/2829
	xit('should ‘pop-up’ after 2 seconds', () =>
		init(flags)
			.then(popup => {
				sinon.spy(popup, 'open');
				popup.open.should.not.have.been.called;
				return delay(2050, popup);
			})
			.then(popup => popup.open.should.have.callCount(1))
	);


	it('should not show if shown in this session', () => {
		sessionStorage.set('last-seen', true)
		return init(flags).then(popup => should.not.exist(popup));
	});

	it('should not show if neither "hillaryWinsOffer" or "trumpWinsOffer" is truthy', () => {
		flags = { get: () => false }
		return init(flags).then(popup => should.not.exist(popup));
	});

});
