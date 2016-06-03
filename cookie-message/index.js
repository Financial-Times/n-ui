import flags from 'next-feature-flags-client';
import store from 'superstore-sync';

const FLAG_NOT_ON = 'Flag not on';
const EXIT_PAGE = 'Exit page';
const COOKIE_CONSENT = 'n-cookie-message:consented';

export default class CookieMessage {

	static init() {
		return CookieMessage
			.ensureMessageIsRequired()
			.then(CookieMessage.setupView)
			.catch(CookieMessage.handleError);
	}

	static ensureMessageIsRequired() {
		return flags.init().then(flags => {
			if(!flags.get('cookieMessage')) {
				throw new Error(FLAG_NOT_ON);
			}
			if (/^\/(errors|opt-out-confirm)/.test(location.pathname)) {
				throw new Error(EXIT_PAGE);
			}
		});
	}

	static handleError(error) {
		if(error.message !== FLAG_NOT_ON && error.message !== EXIT_PAGE) {
			error.stack
				? console.error(error.stack)
				: console.error(error);
		}
	}

	static setupView() {

		if (userHasConsentedToCookies()) {
			return;
		}

		const message = document.createElement('div');

		insertMessage();

		function insertMessage() {
			message.innerHTML = CookieMessage.template();
			message.querySelector('.cookie-message__close-btn').addEventListener('click', flagUserAsConsentingToCookies);
			document.body.insertBefore(message, document.body.firstChild);
		}

		function hideMessage() {
			message.classList.add('cookie-message--hidden');
		}

		function flagUserAsConsentingToCookies() {
			store.local.set(COOKIE_CONSENT, 1);
			hideMessage();
		}

		function userHasConsentedToCookies() {
			if (store.local.get(COOKIE_CONSENT) === 1) {
				return true;
			}

			// HACK: Whilst FT.com is still around auto-opt user in if they have accepted over there.
			if (/\bcookieconsent=accepted(?:;|$)/.test(document.cookie)){
				flagUserAsConsentingToCookies();
				return true;
			}
			return false;
		}

	}

	static template() {
		return `
			<div class="cookie-message cookie-message--banner-centric"
				data-trackable="cookie-message"
				transition="t-cookie-message">

				<div class="cookie-message__container">
					<p class="cookie-message__description">
						By continuing to use this site you consent to the use of cookies.
						<a class="cookie-message__link"
							data-trackable="more-info"
							href="http://help.ft.com/tools-services/how-the-ft-manages-cookies-on-its-websites/">
							Find out more
						</a>
					</p>
					<div class="cookie-message__close-btn-container">
						<button class="cookie-message__close-btn" data-trackable="close">
							<span class="cookie-message__close-btn-label n-util-visually-hidden">Close</span>
						</button>
					</div>
				</div>
			</div>
		`;
	}
}
