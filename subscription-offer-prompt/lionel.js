import SlidingPopup from 'n-sliding-popup';
import Superstore from 'superstore'

import * as utils from './utils';
import { broadcast } from '../utils';

const promptLastSeenStorage = new Superstore('local', 'n-ui.subscription-offer-prompt');
const promptLastSeenStorageKey = 'last-closed';

const getProductSelectorLastSeen = () => {
	const sessionStore = new Superstore('session', 'next.product-selector');
	return sessionStore.get('last-seen');
};

const getPromptLastClosed = () => promptLastSeenStorage.get(promptLastSeenStorageKey);

const setPromptLastClosed = () => promptLastSeenStorage.set(promptLastSeenStorageKey, Date.now());

const getTlsVersion = () => fetch('https://www.howsmyssl.com/a/check')
	.then(response => response.json())
	.then(({ tls_version = '' } = { }) => Number.parseFloat(tls_version.replace('TLS ', '')));

/**
 * Show the prompt if
 *	* not logged in
 *	* not on a barrier page
 *	* the barrier has been seen in this session
 *	* the prompt has not been closed, or was last closed more than 30 days ago
 *	* browser's' TLS version is > 1.0
 */
const shouldPromptBeShown = () => {
	return Promise.all([getProductSelectorLastSeen(), getPromptLastClosed(), getTlsVersion()])
			.then(([barrierLastSeen, promptLastClosed, tlsVersion]) =>
				barrierLastSeen && (!promptLastClosed || promptLastClosed + (1000 * 60 * 60 * 24 * 30) <= Date.now()) && tlsVersion > 1.0
			);
};

const popupTemplate = ({ discount, price, offerId }) => `
	<article class="subscription-prompt--wrapper" data-trackable="subscription-offer-prompt">
		<button class="n-sliding-popup-close" data-n-component="n-sliding-popup-close" data-trackable="close">
			<span class="n-sliding-popup-close-label">Close</span>
		</button>
		<div class="subscription-prompt--header" data-o-grid-colspan="12">
			<span class="subscription-prompt--flag">Limited Offer</span>
			<h1 class="subscription-prompt--heading">You qualify for a ${discount}% subscription discount</h1>
			<span class="subscription-prompt--subheading">
				Pay just ${price} per week for annual Standard Digital access
			</span>
		</div>
		<div class="subscription-prompt--info" data-o-grid-colspan="7">
			<ul class="subscription-prompt--benefits">
				<li class="subscription-prompt--benefit">Access FT.com on your desktop, mobile &amp; tablet</li>
				<li class="subscription-prompt--benefit">5 year company financials archive</li>
				<li class="subscription-prompt--benefit">Personalised email briefings and market moving news</li>
			</ul>
			<a href="https://www.ft.com/signup?offerId=${offerId}" class="subscription-prompt--subscribe-btn" data-trackable="subscribe">Save ${discount}% now</a>
		</div>
		<div class="subscription-prompt--aside" data-o-grid-colspan="5">
			<figure class="subscription-prompt--figure">
				<img src="https://image.webservices.ft.com/v1/images/raw/${encodeURIComponent('http://next-geebee.ft.com/assets/people/lionel.png')}?source=test&amp;width=126" alt="Lionel Barber, Editor">
				<figcaption class="subscription-prompt--figure-caption">Lionel Barber, Editor</span>
			</figure>
		</div>
	</article>
`;

const createPopupHTML = values =>
	utils.createElement('div', {
		'class': 'n-sliding-popup subscription-prompt',
		'data-n-component': 'o-sliding-popup',
		'data-n-sliding-popup-position': 'bottom left',
	}, popupTemplate(values));

const createSubscriptionPrompt = values => {
	const subscriptionPrompt = createPopupHTML(values);
	subscriptionPrompt.onClose = setPromptLastClosed;
	document.body.appendChild(subscriptionPrompt);
	const slidingPopup = new SlidingPopup(subscriptionPrompt);
	setTimeout(() => {
		slidingPopup.open();
		broadcast('oTracking.event', {
			category: 'message',
			action: 'show',
			opportunity: {
				type: 'discount',
				subtype: ''
			},
			offers: [values.offerId]
		});
	}, 2000);
	return slidingPopup;
};

const getPrice = countryCode => {
	const prices = {
		AUS: [479, 'AUD'],
		CAN: [470, 'USD'],
		CHE: [489, 'CHF'],
		GBR: [399, 'GBP'],
		HKG: [3690, 'HKD'],
		JPN: [65300, 'JPN'],
		SGP: [619, 'SGD'],
		USA: [429, 'USD'],
		default: [439, 'EUR']
	};

	return utils.toCurrency.apply(null, prices[countryCode] || prices.default);
};

const getSubscriptionPromptValues = countryCode => {
	const price = getPrice(countryCode);
	if (countryCode === 'USA') {
		return { discount: 33, offerId: 'a9582121-87c2-09a7-0cc0-4caf594985d5', price };
	} else {
		return { discount: 25, offerId: 'c1773439-53dc-df3d-9acc-20ce2ecde318', price };
	}
};

export const init = () => {
	return shouldPromptBeShown()
		.then(shouldShow => {
			if (shouldShow) {
				return fetch('/country', { credentials: 'same-origin' })
					.then(response => response.json())
					.then((countryCode = 'GBR') => {
						// NOTE: for now, while pricing is inconsistent across slider, barrier and form, don't show it for these countries
						if (['SPM', 'ALA', 'BLM', 'MAF', 'AND', 'REU', 'GLP', 'MYT', 'MTQ', 'ZWE'].indexOf(countryCode) > -1) {
							return;
						}
						const subscriptionValues = getSubscriptionPromptValues(countryCode);
						return createSubscriptionPrompt(subscriptionValues);
					});
			}
		})
		.catch(error => {
			broadcast('oErrors.log', {
				error,
				info: {
					message: 'Error initialising subscription offer prompt'
				}
			})
		});
}
