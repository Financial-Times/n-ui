/* globals should */
import Superstore from 'superstore';
import { init } from '../pwr-of-you';

describe('"Pwr Of You" Prompt', () => {

	const localStorage = new Superstore('local', 'n-ui.subscription-offer-pwr-of-you')

	let flags;

	beforeEach(() => {
		flags = { get: (val) => val === 'b2cMessagePrompt' || val === 'PowerOfYouSlider' };
		return localStorage.set('last-closed-pwr', Date.now() - (1000 * 60 * 60 * 24 * 36))
	})

	afterEach(() => {
		return localStorage.unset('last-closed-pwr')
	});

	it('should have correct attributes', () =>
		init(flags).then(popup => {
			popup.el.getAttribute('class').should.include('n-sliding-popup subscription-prompt');
			popup.el.getAttribute('data-n-component').should.equal('o-sliding-popup');
			popup.el.getAttribute('data-n-sliding-popup-position').should.equal('bottom left');
		})
	);

	it('should have correct html', () =>
		init(flags).then(popup => {
			popup.el.innerHTML.should.contain('Want to get your share')
		})
	);

	it('should set onClose to function', () =>
		init(flags).then(popup => {
			popup.el.onClose.should.be.a('function')
		})
	);

	it('should store date in local storage when closed', () =>
		init(flags)
			.then(popup => {
				popup.el.onClose();
				return localStorage.get('last-closed-pwr');
			})
			// give a 1s buffer
			.then(lastClosed => lastClosed.should.be.closeTo(Date.now(), 1000))
	);


	it('should not show if last shown within 30 days', () => {
		localStorage.set('last-closed-pwr', Date.now() - (1000 * 60 * 60 * 24 * 29));
		return init(flags).then(popup => should.not.exist(popup));
	});

});
