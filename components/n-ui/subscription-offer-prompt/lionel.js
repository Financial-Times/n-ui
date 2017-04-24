import SlidingPopup from 'n-sliding-popup';
import Superstore from 'superstore'

import * as utils from './utils';
import { broadcast } from 'n-ui-foundations';

const promptLastSeenStorage = new Superstore('local', 'n-ui.subscription-offer-prompt');
const promptLastSeenStorageKey = 'last-closed';

const getProductSelectorLastSeen = () => {
	const sessionStore = new Superstore('session', 'next.product-selector');
	return sessionStore.get('last-seen')
		.catch(() => null)
};

const getPromptLastClosed = () => promptLastSeenStorage.get(promptLastSeenStorageKey);

const setPromptLastClosed = () => promptLastSeenStorage.set(promptLastSeenStorageKey, Date.now());

const getTlsVersion = () => fetch('https://howsmyssl.memb.ft.com/a/check')
	.then(response => response.json())
	.then(({ tls_version = '' } = { }) => parseFloat(tls_version.replace('TLS ', '')));

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

const popupTemplate = ({ discount, price, offerId, offerText}) => `
	<article class="subscription-prompt--wrapper" data-trackable="subscription-offer-prompt">
		<button class="n-sliding-popup-close" data-n-component="n-sliding-popup-close" data-trackable="close">
			<span class="n-sliding-popup-close-label">Close</span>
		</button>
		<div class="subscription-prompt--header" data-o-grid-colspan="12">
			<span class="subscription-prompt--flag">Limited Offer</span>
			<h1 class="subscription-prompt--heading">${offerText}</h1>
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
				<img src="https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent('http://www.ft.com/__assets/creatives/people/lionel.png')}?source=test&amp;width=126" alt="Lionel Barber, Editor">
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
	let focusedElementBeforePrompt;
	let focusableElementsStrings = ['.subscription-prompt--subscribe-btn', '.n-sliding-popup-close'];

	const subscriptionPrompt = createPopupHTML(values);
	let focusableElements = subscriptionPrompt.querySelectorAll(focusableElementsStrings);
	focusableElements = Array.prototype.slice.call(focusableElements);

	subscriptionPrompt.onClose = () => {
		setPromptLastClosed();

		if(focusedElementBeforePrompt !== undefined) {
			focusedElementBeforePrompt.focus();
		}
		subscriptionPrompt.removeEventListener('keydown', trapTab);
		focusableElements.forEach((elem) => {
			elem.setAttribute('tabindex', '-1');
		});
	}
	document.body.appendChild(subscriptionPrompt);

	let firstTabStop = focusableElements[0];
	let lastTabStop = focusableElements[focusableElements.length - 1];

	const trapTab = (e) => {
		if(e.keyCode === 9) { //TAB key
			if(e.shiftKey) {
				if(document.activeElement === firstTabStop) {
					e.preventDefault();
					lastTabStop.focus();
				}
			} else {
				if(document.activeElement === lastTabStop) {
					e.preventDefault();
					firstTabStop.focus();
				}
			}
		}

		if(e.keyCode === 27) { //ESC key
			slidingPopup.close();
		}
	};

	subscriptionPrompt.addEventListener('keydown', trapTab);

	const slidingPopup = new SlidingPopup(subscriptionPrompt);

	setTimeout(() => {
		slidingPopup.open();
		focusedElementBeforePrompt = document.activeElement;
		firstTabStop.focus();

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

const getPrice = (countryCode, flags) => {
	let prices;
	if (flags.get('priceFlashSale')) {
		prices = {
			AUS: [429, 'AUD'],
			CAN: [429, 'USD'],
			CHE: [439, 'CHF'],
			GBR: [355, 'GBP'],
			HKG: [3295, 'HKD'],
			JPN: [583, 'JPN'],
			SGP: [555, 'SGD'],
			USA: [429, 'USD'],
			default: [395, 'EUR']
		};
	} else {
		prices = {
			AUS: [479, 'AUD'],
			CAN: [470, 'USD'], // This is different from API (479)
			CHE: [489, 'CHF'],
			GBR: [399, 'GBP'],
			HKG: [3690, 'HKD'], // This is different from API (3689)
			JPN: [65300, 'JPN'], // This is different from API (653)
			SGP: [619, 'SGD'],
			USA: [429, 'USD'],
			default: [439, 'EUR']
		};
	}
	return utils.toCurrency.apply(null, prices[countryCode] || prices.default);
};

const getSubscriptionPromptValues = (countryCode, flags) => {
	const price = getPrice(countryCode, flags);
	if (countryCode === 'USA' || flags.get('priceFlashSale')) {
		return { discount: 33, offerId: 'a9582121-87c2-09a7-0cc0-4caf594985d5', price, offerText: 'Save 33% now'};
	} else {
		return { discount: 25, offerId: 'c1773439-53dc-df3d-9acc-20ce2ecde318', price, offerText: 'You qualify for a 25% subscription discount'};
	}
};

export const init = (flags) => {
	return shouldPromptBeShown()
		.then(shouldShow => {
			if (shouldShow) {
				return fetch('https://www.ft.com/country', { credentials: 'same-origin' })
					.then(response => response.json())
					.then((countryCode = 'GBR') => {
						// NOTE: for now, while pricing is inconsistent across slider, barrier and form, don't show it for these countries
						if (['SPM', 'ALA', 'BLM', 'MAF', 'AND', 'REU', 'GLP', 'MYT', 'MTQ', 'ZWE'].indexOf(countryCode) > -1) {
							return;
						}
						const subscriptionValues = getSubscriptionPromptValues(countryCode, flags);
						return createSubscriptionPrompt(subscriptionValues);
					});
			}
		});
}
