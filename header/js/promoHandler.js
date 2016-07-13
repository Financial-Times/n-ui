// MAKE ANY DISCOUNT CHANGES HERE
// Update flags and next-product selector accordingly
const discount = {
	L: 50,
	S: 25
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
						showPromo(flags);
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
