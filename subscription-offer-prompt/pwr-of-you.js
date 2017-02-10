import SlidingPopup from 'n-sliding-popup';
import Superstore from 'superstore'

import * as utils from './utils';
import { broadcast } from '../utils';

const promptLastSeenStorage = new Superstore('local', 'n-ui.subscription-offer-pwr-of-you');
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
				return (!promptLastClosed || promptLastClosed + (1000 * 60 * 60 * 24 * 30) <= Date.now()) && flags.get('PowerOfYouSlider');
			})
};

// TODO we'll move HTML out of here so it can be Pa11y'd
// OK for now to have it be the same as the lionel slider
const popupTemplate = () => `
	<aside class="subscription-prompt--wrapper subscription-prompt--pwr" data-trackable="subscription-offer-pwr-of-you">
		<button class="n-sliding-popup-close" data-n-component="n-sliding-popup-close" data-trackable="close">
			<span class="n-sliding-popup-close-label">Close</span>
		</button>
		<div class="o-grid-row">
			<div data="o-grid-colspan-12">powr of you logo</div>
		</div>
		<div class="o-grid-row">
			<div class="subscription-prompt--header" data-o-grid-colspan="12">
				<p> Everyone takes your data. </p>
				<p> Time for <span class="orange-highlight">you</span> to take control</p>
			</div>
		</div>
		<div class="o-grid-row">
			<div data="o-grid-colspan-12 subscription-prompt--info">
				<p> Your time online is valuable. It's driving the $500 billion data economy. Want to get your share? </p>
			</div>
		</div>
		<div class="o-grid-row">
			<div data="o-grid-colspan-6">
				<button class="o-buttons">Tell me more</button>
			</div>
			<div data="o-grid-colspan-6">
				<button class="o-buttons o-buttons--standout">Yes</button>
			</div>
		</div>
	</aside>
`;

const createPopupHTML = () =>
	utils.createElement('div', {
		'class': 'n-sliding-popup subscription-prompt--us',
		'data-n-component': 'o-sliding-popup',
		'data-n-sliding-popup-position': 'bottom left',
	}, popupTemplate());

const createPrompt = () => {
	const prompt = createPopupHTML();
	prompt.onClose = setPromptLastClosed;
	document.body.appendChild(prompt);
	const slidingPopup = new SlidingPopup(prompt);
	setTimeout(() => {
		slidingPopup.open();

		// TODO find out what tracking we need
		broadcast('oTracking.event', {
			category: 'message',
			action: 'show',
			context: {
				messageType: 'pwrOfYou'
			}
		});
	}, 2000);
	return slidingPopup;
};

export const init = (flags) => {
	return shouldPromptBeShown(flags)
		.then(shouldShow => {
			if (shouldShow) {
				return createPrompt();
			}
		})
		.catch(error => {
			broadcast('oErrors.log', {
				error,
				info: {
					message: 'Error initialising Pwr Of You Prompt'
				}
			})
		});
}
