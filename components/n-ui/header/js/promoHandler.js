// MAKE ANY DISCOUNT CHANGES HERE
// Update flags and next-product selector accordingly

import nSessionClient from 'next-session-client';
import Superstore from 'superstore';

const { products } = nSessionClient;

const discount = {
	L: 50,
	S: 25,
	S_5: 25
};

function supportsCors () {
	return ('withCredentials' in new XMLHttpRequest());
}

function getUserProducts (){
	return products()
		.catch(() => {
			return {};
		});
}

function decorateTheSession (session) {
	session.isForRegisteredUser = sessionIsForRegisteredUser(session);
	session.isForWeekendUser = sessionIsForWeekendUser(session);
	// no products. see https://jira.ft.com/browse/NFT-700
	session.isForAnonymousUser = !session.products && !session.uuid;
	return session;
}

function isSignupForm () {
	return window.location.pathname === '/signup'
		|| window.location.pathname === '/thank-you';
}

function isMyAccount () {
	return document.documentElement.dataset && document.documentElement.dataset.nextApp === 'control-centre';
}

function isBarrier () {
	return !!document.querySelector('.barrier');
}

function isB2BProspect (flags) {
	if(flags.b2bCommsCohort) {
		return Promise.resolve(true);
	}
	const sessionStore = new Superstore('session', 'next.product-selector');
	return sessionStore.get('barrier-messaging')
		.then(barrier => barrier === 'B2B')
		.catch(() => false);
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
			<a href="https://www.ft.com/products?segmentId=05a3d326-9abe-5885-4ee2-8d58d9a9a4ea" class="n-header__marketing-promo__box n-header__marketing-promo__box--us" data-trackable="marketing-promo:box">
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
	return flags.get('discountOn') && flags.get('headerMarketingPromo');
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
 * - My Account
 * - B2B prospects
 */
export function init (flags) {

	// If it's the signup form, a barrier, or My account, just stop
	if (!isSignupForm() && !isBarrier() && !isMyAccount()) {
		// If the last barrier shown was B2B, just stop
		isB2BProspect(flags).then(isB2B => {
			if(!isB2B){
				// If it's a CORS-compatible browser, fetch the session
				if (supportsCors()) {
					getUserProducts()
						.then(decorateTheSession)
						.then(function (session) {
							if (session.isForAnonymousUser || session.isForRegisteredUser || session.isForWeekendUser) {

								if (showElectionsOffer(flags)) {
									showElectionPromo();
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
		});
	}
}
