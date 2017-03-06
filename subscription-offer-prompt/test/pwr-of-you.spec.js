// /* globals expect,should,sinon */
// import Superstore from 'superstore';
// import { init } from '../pwr-of-you';
// import api from '../countryApi';

// sinon.stub(api, 'getCountryCode', function () {
// 	return 'GBR'
// })

// describe('"Pwr Of You" Prompt', () => {

// 	const localStorage = new Superstore('local', 'n-ui.subscription-offer-pwr-of-you')
// 	const lionelStorage = new Superstore('local', 'n-ui.subscription-offer-prompt');

// 	let flags;

// 	beforeEach(() => {
// 		flags = { get: (val) => val === 'b2cMessagePrompt' || val === 'PowerOfYouSlider' };

// 		return Promise.all([
// 			// pwr was closed over 30 days ago (we should show it again)
// 			localStorage.set('last-closed-pwr', Date.now() - (1000 * 60 * 60 * 24 * 36)),
// 			// lionel was closed recently
// 			lionelStorage.set('last-closed', Date.now())
// 		])

// 	});

// 	afterEach(() => {
// 		return Promise.all([
// 			// localStorage.unset('last-closed-pwr'),
// 			// lionelStorage.unset('last-closed')
// 		])
// 	});

// 	// First check the popup is actually there
// 	it ('should be a popup', () =>
// 		init(flags).then(popup => {
// 			expect(popup).to.be.ok;
// 		})
// 	);

// 	it('should have correct attributes', () =>
// 		init(flags).then(popup => {
// 			popup.el.getAttribute('class').should.include('n-sliding-popup subscription-prompt');
// 			popup.el.getAttribute('data-n-component').should.equal('o-sliding-popup');
// 			popup.el.getAttribute('data-n-sliding-popup-position').should.equal('bottom left');
// 		})
// 	);

// 	it('should have correct html', () =>
// 		init(flags).then(popup => {
// 			popup.el.innerHTML.should.contain('Want to get your share')
// 		})
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
// 				return localStorage.get('last-closed-pwr');
// 			})
// 			// give a 1s buffer
// 			.then(lastClosed => lastClosed.should.be.closeTo(Date.now(), 1000))
// 	);


// 	it('should not show if last shown within 30 days', () => {
// 		localStorage.set('last-closed-pwr', Date.now() - (1000 * 60 * 60 * 24 * 29));
// 		return init(flags).then(popup => should.not.exist(popup));
// 	});

// });
