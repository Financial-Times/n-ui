import SlidingPopup from 'n-sliding-popup';
import Superstore from 'superstore';

import * as utils from './utils';
import { broadcast } from '../utils';

const promptLastSeenSessionStore = new Superstore('session', 'n-ui.subscription-offer-prompt-us-election-result');
const promptLastSeenStorageKey = 'last-seen';

const getPromptLastSeen = () => promptLastSeenSessionStore.get(promptLastSeenStorageKey);

const setPromptLastSeen = () => promptLastSeenSessionStore.set(promptLastSeenStorageKey, true);

const getTlsVersion = () => fetch('https://www.howsmyssl.com/a/check')
	.then(response => response.json())
	.then(({ tls_version = '' } = { }) => Number.parseFloat(tls_version.replace('TLS ', '')));

const getFlagIsPresent = flags => {
	return (flags.get('hillaryWinsOffer') || flags.get('trumpWinsOffer') || (flags.get('trumpWinsTest')));
};

/**
 * Show the prompt if
 *	* not logged in
 *	* the prompt has NOT been seen in this session
 *	* browser's' TLS version is > 1.0
 */
const shouldPromptBeShown = (flags) => {
	return Promise.all([getPromptLastSeen(), getTlsVersion(), getFlagIsPresent(flags)])
			.then(([promptSeen, tlsVersion, flagIsPresent]) =>
				!promptSeen && tlsVersion > 1.0 && flagIsPresent
			);
};

const popupTemplate = ({ offerId, discount, candidate }) => `
	<div class="subscription-offer-prompt--marquee">
		<h2 class="subscription-prompt--marquee-badge">Limited Time Offer</h2>
	</div>
	<article class="subscription-prompt--wrapper" data-trackable="subscription-offer-prompt-us-elections">
		<div class="subscription-offer-prompt--badge">
			<img src="https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent('https://d1u6uv4wzxfsok.cloudfront.net/sparrow_v1/ft1_XX_sparrow_v1/images/us_election_icon_desktop_235x151px_x2.png')}?source=offer-prompt-us&amp;width=170"" alt="US Election Flags">
		</div>
		<button class="n-sliding-popup-close" data-n-component="n-sliding-popup-close" data-trackable="close">
			<span class="n-sliding-popup-close-label">Close</span>
		</button>
		<div class="subscription-prompt--header">
			<h1 class="subscription-prompt--heading">America Appoints ${candidate}</h1>
			<span class="subscription-prompt--subheading">
				Get the latest news and analysis on the President-elect.
			</span>
		</div>
		<a href="https://subscription.ft.com/?offerId=${offerId}&segID=9842efac-fde8-3ff9-40f0-4a5e68b2f890" class="subscription-prompt--subscribe-btn" data-trackable="subscribe">Subscribe and save ${discount}%</a>
		<small class="subscription-prompt--disclaimer">*Terms and conditions apply</small>
	</article>
`;

const createPopupHTML = values =>
	utils.createElement('div', {
		'class': 'n-sliding-popup subscription-prompt--us subscription-prompt--us-elect',
		'data-n-component': 'o-sliding-popup',
		'data-n-sliding-popup-position': 'bottom left',
	}, popupTemplate(values));

const createSubscriptionPrompt = values => {
	const subscriptionPrompt = createPopupHTML(values);
	document.body.appendChild(subscriptionPrompt);
	const slidingPopup = new SlidingPopup(subscriptionPrompt);
	setTimeout(() => {
		slidingPopup.open();
		setPromptLastSeen();
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

const getSubscriptionCandidateValue = flags => {
	if (flags.get('trumpWinsOffer') || flags.get('trumpWinsTest')) {
		return 'Donald Trump';
	} else if (flags.get('hillaryWinsOffer')) {
		return 'Hillary Clinton';
	} else {
		return 'new President'; // fallback - should never be shown
	}
};

export const init = (flags) => {
	return shouldPromptBeShown(flags)
		.then(shouldShow => {
			if (shouldShow) {
				const promptValues = {
					discount: 25,
					offerId: '1dbc248e-b98d-b703-bc25-a05cc5670804',
					candidate: getSubscriptionCandidateValue(flags)
				};
				return createSubscriptionPrompt(promptValues);
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
