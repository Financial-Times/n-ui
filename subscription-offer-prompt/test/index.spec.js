/* globals should, sinon */
import SlidingPopup from 'n-sliding-popup';
import Superstore from 'superstore';
import { init } from '../index';

const delay = (ms, value) => new Promise(resolve => setTimeout(resolve.bind(null, value), ms));

describe.only('Subscription Offer Prompt', () => {

	const localStorage = new Superstore('local', 'n-ui.subscription-offer-prompt')
	const sessionStorage = new Superstore('session', 'next.product-selector')

	beforeEach(() => {
		Object.defineProperty(document, 'cookie', { value: '', configurable: true });
		sinon.stub(window, 'fetch').returns(Promise.resolve({
			json: sinon.stub().returns(Promise.resolve('GBR'))
		}));

		return Promise.all([
			localStorage.set('last-closed', Date.now() - (1000 * 60 * 60 * 24 * 30)),
			sessionStorage.set('last-seen', Date.now())
		])
	});

	afterEach(() => {
		window.fetch.restore();
		delete document.cookie;

		return Promise.all([
			localStorage.unset('last-closed'),
			sessionStorage.unset('last-seen')
		]);
	});

	it('should show prompt if navigated from barrier page, not on a barrier page, not logged in and hasnt been shown in 30 days', () =>
		init().then(popup => popup.should.be.an instanceof(SlidingPopup))
	);

	it('should have correct attributes', () =>
		init().then(popup => {
			popup.el.getAttribute('class').should.include('n-sliding-popup subscription-prompt');
			popup.el.getAttribute('data-n-component').should.equal('o-sliding-popup');
			popup.el.getAttribute('data-n-sliding-popup-position').should.equal('bottom left');
		})
	);

	it('should have correct html', () =>
		init().then(popup => {
			popup.el.innerHTML.should.contain('You qualify for a 25% subscription discount')
		})
	);

	it('should set onClose to function', () =>
		init().then(popup => {
			popup.el.onClose.should.be.a('function')
		})
	);

	it('should store date in local storage when closed', () =>
		init()
			.then(popup => {
				popup.el.onClose();
				return localStorage.get('last-closed');
			})
			// give a 1s buffer
			.then(lastClosed => lastClosed.should.be.closeTo(Date.now(), 1000))
	);

	it('should ‘pop-up’ after 2 seconds', () =>
		init()
			.then(popup => {
				sinon.spy(popup, 'open');
				popup.open.should.not.have.been.called;
				return delay(2050, popup);
			})
			.then(popup => popup.open.should.have.callCount(1))
	);

	it('should not not show on barrier pages', () => {
		const barrier = document.createElement('div');
		barrier.className = 'ft-subscription-panel';
		document.body.appendChild(barrier);
		return init()
			.then(popup => {
				document.body.removeChild(barrier);
				should.not.exist(popup);
			});
	});

	it('should not show if logged in', () => {
		Object.defineProperty(document, 'cookie', { value: 'FTSession=foo', configurable: true });
		return init().then(popup => should.not.exist(popup));
	});

	it('should not show if last shown within 30 days', () => {
		localStorage.set('last-closed', Date.now() + (1000 * 60 * 60 * 24 * 29));
		return init().then(popup => should.not.exist(popup));
	});

	it('should not show barrier page has not been visited in this session', () => {
		sessionStorage.unset('last-seen');
		return init().then(popup => should.not.exist(popup));
	});

});
