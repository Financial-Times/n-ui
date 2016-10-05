/* globals describe, it, beforeEach, afterEach, expect, sinon */
import SlidingPopup from 'n-sliding-popup';
import { initPrompt, init } from '../index';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Subscription Offer Prompt', () => {

	describe('initPrompt', () => {
		let popup;

		beforeEach(() => popup = initPrompt(true));
		afterEach(() => {
			let popups = document.querySelectorAll('.subscription-prompt');
			for (let i = 0; i < popups.length; ++i) {
				popups[i].parentElement.removeChild(popups[i]);
			}
		});

		it('returns undefined with falsey first argument', () => {
			expect(initPrompt(false)).to.equal(undefined);
		});

		it('creates a SlidingPopup', () =>
			expect(popup).to.be.instanceOf(SlidingPopup)
		);

		it('el has correct attributes', () => {
			expect(popup.el.getAttribute('class')).to.include('n-sliding-popup subscription-prompt');
			expect(popup.el.getAttribute('data-n-component')).to.equal('o-sliding-popup');
			expect(popup.el.getAttribute('data-n-sliding-popup-position')).to.equal('bottom left');
		});

		it('el has correct html', () =>
			expect(popup.el.innerHTML).to.contain('You qualify for a 25% subscription discount')
		);

		it('sets onClose to function', () =>
			expect(popup.el.onClose).to.be.a('function')
		);

		it('sets localStorage["b2c-subscription-offer-prompt"] to 30 days in future when onClose is called', () => {
			popup.el.onClose();
			// need a 1-2ms buffer for slow JS engines or busy CPUs
			expect(new Date(localStorage['b2c-subscription-offer-prompt']).getTime()).to.be.closeTo(Date.now() + 2592000000, 2);
		});

		it('is shown after 2 seconds', () => {
			sinon.spy(popup, 'open');
			expect(popup.open).to.not.have.been.called;
			return delay(2050).then(() => expect(popup.open).to.have.callCount(1))
		});

	});

	describe('init', () => {

		beforeEach(() => {
			localStorage.setItem('b2c-subscription-offer-prompt', Date.now() - 10000);
			sessionStorage.setItem('last-seen-barrier', Date.now() - 10000);
			Object.defineProperty(document, 'cookie', { value: '', configurable: true });
			sinon.stub(window, 'fetch').returns(Promise.resolve({
				json: sinon.stub().returns(Promise.resolve('GBR'))
			}));
		});

		afterEach(() => {
			localStorage.removeItem('b2c-subscription-offer-prompt');
			sessionStorage.removeItem('last-seen-barrier');
			window.fetch.restore();
			delete document.cookie;
		});

		it('returns initPrompt value if navigated from barrier page, not logged in and hasnt been shown in 30 days', () =>
			init().then((popup) => expect(popup).to.be.instanceOf(SlidingPopup))
		);

		it('does not show on barrier page', () => {
			const barrier = document.createElement('div');
			barrier.className = 'ft-subscription-panel';
			document.body.appendChild(barrier);
			return init().then(popup => {
				document.body.removeChild(barrier);
				expect(popup).to.equal(undefined);
			});
		});

		it('does not show if FTSession cookie is present', () => {
			Object.defineProperty(document, 'cookie', { value: 'FTSession=foo', configurable: true });
			return init().then(popup => expect(popup).to.equal(undefined));
		});

		it('does not show if b2c-subscription-offer-prompt date is in future', () => {
			localStorage.setItem('b2c-subscription-offer-prompt', new Date(9999999999999).toGMTString());
			return init().then(popup => expect(popup).to.equal(undefined));
		});

		it('does not show if barrier page has yet to be visited', () => {
			sessionStorage.removeItem('last-seen-barrier');
			return init().then(popup => expect(popup).to.equal(undefined));
		});

	});

});
