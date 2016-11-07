import SlidingPopup from 'n-sliding-popup';
import Superstore from 'superstore'

import * as utils from './utils';
import { broadcast } from '../utils';

const promptLastSeenStorage = new Superstore('local', 'n-ui.subscription-offer-prompt-us-elections');
const promptLastSeenStorageKey = 'last-closed';

const getPromptLastClosed = () => promptLastSeenStorage.get(promptLastSeenStorageKey);

const setPromptLastClosed = () => promptLastSeenStorage.set(promptLastSeenStorageKey, Date.now());

/**
 * Show the prompt if
 *	* the prompt has not been closed, or was last closed more than 30 days ago
 *	* usElection2016DiscountSlider flag is true
 */
const shouldPromptBeShown = (flags) => {
	return getPromptLastClosed()
			.then(promptLastClosed => {
				return (!promptLastClosed || promptLastClosed + (1000 * 60 * 60 * 24 * 30) <= Date.now()) && flags.get('usElection2016DiscountSlider');
			})
};

const popupTemplate = ({ amount, countryCode }) => `
	<article class="subscription-prompt--wrapper" data-trackable="subscription-offer-prompt-us-elections">
		<div class="subscription-offer-prompt--badge">
			<img src="https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent('https://d1u6uv4wzxfsok.cloudfront.net/sparrow_v1/ft1_XX_sparrow_v1/images/us_election_icon_desktop_235x151px_x2.png')}?source=offer-prompt-us&amp;width=170"" alt="US Election Flags">
		</div>
		<button class="n-sliding-popup-close" data-n-component="n-sliding-popup-close" data-trackable="close">
			<span class="n-sliding-popup-close-label">Close</span>
		</button>
		<div class="subscription-prompt--header" data-o-grid-colspan="12">
			<h1 class="subscription-prompt--heading">Your global perspective this US election</h1>
			<span class="subscription-prompt--subheading">
				Get the latest news and analysis in the race for the White House.
			</span>
		</div>
		<a href="https://sub.ft.com/spa_uselection/?segmentId=b0cc72ef-a788-b64a-8860-bbd7e9713d62&utm_source=election&utm_medium=onsite_link&utm_campaign=2016_Q4_US_Election_poll_page&countryCode=${countryCode}" class="subscription-prompt--subscribe-btn" data-trackable="subscribe">Try the FT for 3 months for <small>${amount.currency}</small>${amount.symbol}${amount.value}*</a>
		<small class="subscription-prompt--disclaimer">*Terms and conditions apply</small>
	</article>
`;

const createPopupHTML = values =>
	utils.createElement('div', {
		'class': 'n-sliding-popup subscription-prompt--us',
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

const fetchOffer = (countryCode) => {
	const url = `https://next-signup-api.ft.com/offer/62c5c138-aad3-10d7-5aa1-b5a4416f60bd?countryCode=${countryCode}`;

	return fetch(url,
		{
			credentials: 'same-origin',
			'x-api-env': 'prod'
		})
		.then(response => response.json())
		.then(({ data }={}) => {
			const pricing = data.offer.charges.find(p => p.billing_period === 'trial');
			return {offerId: data.offer.id, amount: pricing.amount, countryCode: countryCode}
		})
}

export const init = (flags) => {
	return shouldPromptBeShown(flags)
		.then(shouldShow => {
			if (shouldShow) {
				return fetch('/country', { credentials: 'same-origin' })
					.then(response => response.json())
					.then((countryCode = 'GBR') => {
						return fetchOffer(countryCode)
					})
					.then(pricing => {
						const subscriptionValues = pricing;
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
