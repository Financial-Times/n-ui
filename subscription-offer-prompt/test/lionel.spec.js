/* globals expect,should,sinon */
import SlidingPopup from 'n-sliding-popup';
import Superstore from 'superstore';
import { init } from '../lionel';

const delay = (ms, value) => new Promise(resolve => setTimeout(resolve.bind(null, value), ms));

describe('Lionel Slider', function () {

	const localStorage = new Superstore('local', 'n-ui.subscription-offer-prompt')
	const sessionStorage = new Superstore('session', 'next.product-selector')
	let flags;
	let fetchStub;

	beforeEach(() => {
		flags = { get: (val) => val === 'b2cMessagePrompt' || val === 'priceFlashSale' };
		fetchStub = sinon.stub(window, 'fetch');
		fetchStub
			.withArgs('https://www.howsmyssl.com/a/check')
			.returns(Promise.resolve({
				json: () => Promise.resolve({ tls_version: 'TLS 1.2' })
			}));

		return Promise.all([
			localStorage.set('last-closed', Date.now() - (1000 * 60 * 60 * 24 * 30)),
			sessionStorage.set('last-seen', Date.now())
		])
	});

	afterEach(() => {
		window.fetch.restore();
		fetchStub = null;

		// fixme - the tests fail in IE11 if these are not commented out.  I have no idea why..
		return Promise.all([
			// localStorage.unset('last-closed'),
			// sessionStorage.unset('last-seen')
		]);
	});

	// describe('"Lionel Slider" Subscription Offer Prompt', () => {

	// 	beforeEach(() => {
	// 		fetchStub
	// 			.withArgs('/country')
	// 			.returns(Promise.resolve({
	// 				json: () => Promise.resolve('GBR')
	// 			}));
	// 	});


	// 	it ('should be a popup', () =>
	// 		init(flags).then(popup => {
	// 			expect(popup).to.be.ok;
	// 		})
	// 	);


	// 	it('should show prompt if navigated from barrier page, not on a barrier page and hasnt been shown in 30 days', () =>
	// 		init(flags).then(popup => popup.should.be.an.instanceof(SlidingPopup))
	// 	);

	// 	it('should have correct attributes', () =>
	// 		init(flags).then(popup => {
	// 			popup.el.getAttribute('class').should.include('n-sliding-popup subscription-prompt');
	// 			popup.el.getAttribute('data-n-component').should.equal('o-sliding-popup');
	// 			popup.el.getAttribute('data-n-sliding-popup-position').should.equal('bottom left');
	// 		})
	// 	);

	// 	it('should have correct html when the priceFlashSale flag is on', () =>
	// 		init(flags).then(popup => {
	// 			popup.el.innerHTML.should.contain('Save 33% now')
	// 		})
	// 	);

	// 	it('should have correct html when the priceFlashSale flag is off', () => {
	// 			flags = { get: (val) => val === 'b2cMessagePrompt'};
	// 			init(flags).then(popup => {
	// 				popup.el.innerHTML.should.contain('You qualify for a 25% subscription discount')
	// 			})
	// 		}
	// 	);

	// 	it('should set onClose to function', () =>
	// 		init(flags).then(popup => {
	// 			popup.el.onClose.should.be.a('function')
	// 		})
	// 	);

	// 	it('should store date in local storage when closed', () =>
	// 		init(flags)
	// 			.then(popup => {
	// 				popup.el.onClose();
	// 				return localStorage.get('last-closed');
	// 			})
	// 			// give a 1s buffer
	// 			.then(lastClosed => lastClosed.should.be.closeTo(Date.now(), 1000))
	// 	);

	// 	// TODO: naughty, but errors for unknown reason - https://circleci.com/gh/Financial-Times/n-ui/2829
	// 	xit('should ‘pop-up’ after 2 seconds', () =>
	// 		init(flags)
	// 			.then(popup => {
	// 				sinon.spy(popup, 'open');
	// 				popup.open.should.not.have.been.called;
	// 				return delay(2050, popup);
	// 			})
	// 			.then(popup => popup.open.should.have.callCount(1))
	// 	);


	// 	it('should not show if last shown within 30 days', () => {
	// 		localStorage.set('last-closed', Date.now() + (1000 * 60 * 60 * 24 * 29));
	// 		return init(flags).then(popup => should.not.exist(popup));
	// 	});

	// 	it('should not show barrier page has not been visited in this session', () => {
	// 		sessionStorage.unset('last-seen');
	// 		return init(flags).then(popup => should.not.exist(popup));
	// 	});

	// });

	describe('"Lionel Slider" Subscription Offer Prompt - USA', () => {

		beforeEach(() => {
			fetchStub
				.withArgs('/country')
				.returns(Promise.resolve({
					json: () => Promise.resolve('USA')
				}));
		});

		it('should have correct price when the priceFlashSale flag is on', () =>
			init(flags).then(popup => {
				popup.el.innerHTML.should.contain('$4.29')
			})
		);

		it('should have correct price when the priceFlashSale flag is off', () => {
				flags = { get: (val) => val === 'b2cMessagePrompt'};
				init(flags).then(popup => {
					popup.el.innerHTML.should.contain('$4.29')
				})
			}
		);

	});

	// describe('"Lionel Slider" Subscription Offer Prompt - country code not listed', () => {

	// 	beforeEach(() => {
	// 		fetchStub
	// 			.withArgs('/country')
	// 			.returns(Promise.resolve({
	// 				json: () => Promise.resolve('ISR')
	// 			}));
	// 	});

	// 	it('should default to Euros when country code is one not listed', () => {
	// 			flags = { get: (val) => val === 'b2cMessagePrompt'};
	// 			init(flags).then(popup => {
	// 				popup.el.innerHTML.should.contain('€4.39')
	// 			})
	// 		}
	// 	);

	// });

});
