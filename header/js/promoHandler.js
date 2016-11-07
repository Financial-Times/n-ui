// MAKE ANY DISCOUNT CHANGES HERE
// Update flags and next-product selector accordingly
const discount = {
	L: 50,
	S: 25,
	S_5: 25
}

function fetchSession () {
	return fetch('https://session-next.ft.com/', {
		timeout: 2000,
		credentials: 'include'
	});
}

function extractResult (response) {
	switch (response.status) {
		case 404:
			return {};
		case 200:
			return response.json();
		default:
			throw new Error(`${response.status} - ${response.statusTest}`);
	}
}


function supportsCors () {
	return ('withCredentials' in new XMLHttpRequest());
}

function decorateTheSession (session) {
	session.isForRegisteredUser = sessionIsForRegisteredUser(session);
	session.isForWeekendUser = sessionIsForWeekendUser(session);
	session.isForAnonymousUser = !session.products;
	return session;
}

function isSignupForm () {
	return window.location.pathname === '/signup'
		|| window.location.pathname === '/thank-you';
}

function isBarrier () {
	return !!document.querySelector('.barrier');
}

function showPromo (flags) {
	const promo = document.querySelector('.n-header__marketing-promo');

	if (promo) {
		const discountSpan = document.querySelector('#discountPercent');

		if (discountSpan) {
			discountSpan.innerText = `${discount[flags.barrierDiscountByCohort]}%`;
		}
		promo.classList.add('visible');
	}
}

function showElectionPromo () {
	const promo = document.querySelector('.n-header__marketing-promo');
	if (promo) {
		promo.style.background = '#0088C1';
		promo.innerHTML = `
		<div class="n-header__marketing-promo__container o-header__container">
			<a href="https://www.ft.com/signup?offerId=1dbc248e-b98d-b703-bc25-a05cc5670804" class="n-header__marketing-promo__box n-header__marketing-promo__box--us" data-trackable="marketing-promo:box">
				<div class="n-header__marketing-promo__link" data-trackable="marketing-promo-elections:link">LIMITED TIME OFFER: Subscribe &amp; save 25%</div>
			</a>
		</div>`;
		promo.classList.add('visible');
	}
}

function checkAnonWithoutSession () {
	return document.cookie.indexOf('USERNAME');
}

function sessionIsForRegisteredUser (session) {
	return session.products
		&& session.products.indexOf('P0') > -1
		&& session.products.indexOf('P1') === -1
		&& session.products.indexOf('P2') === -1;
}

function sessionIsForWeekendUser (session) {
	return session.products
		&& session.products.indexOf('P6') > -1
		&& session.products.indexOf('P1') === -1
		&& session.products.indexOf('P2') === -1;
}

function showElectionsOffer (flags) {
	return (flags.get('trumpWinsOffer') || flags.get('trumpWinsTest') || flags.get('hillaryWinsOffer'));
}

/**
 * We want to show the marketing promo to:
 * - Anonymous users
 * - Weekend users
 * - Registered users
 *
 * We want to hide the marketing promo from:
 * - Signup form
 * - Barriers
 */
export function init (flags) {

	// If it's the signup form or a barrier, just stop
	if (!isSignupForm() && !isBarrier()) {

		// If it's a CORS-compatible browser, fetch the session
		if (supportsCors()) {
			fetchSession()
				.then(extractResult)
				.then(decorateTheSession)
				.then(function (session) {
					if (session.isForAnonymousUser || session.isForRegisteredUser || session.isForWeekendUser) {

						if (showElectionsOffer(flags)) {
							showElectionPromo()
						} else {
							showPromo(flags);
						}

					}
				});
		}
		else if (checkAnonWithoutSession()) {
			// If can't do cors but anonymous, just show the promo
			// Pending cors solution
			showPromo(flags);
		}
	}
}
