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
	console.log("here shouldPromptBeShown")
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
			<div data-o-grid-colspan="12">
				<img src="{{#resize 300}}//www.ft.com/__assets/creatives/third-party/direct-debit-transparent.png{{/resize}}">
			</div>
		</div>
		<div class="o-grid-row subscription-prompt--pwr__lead">
			<div data-o-grid-colspan="12">
				<p> Everyone takes your data. </p>
				<p> Time for <span class="subscription-prompt--pwr__lead__highlight">you</span> to take control</p>
			</div>
		</div>
		<div class="o-grid-row">
			<div data-o-grid-colspan="12" class="subscription-prompt--pwr__main">
				<p> Your time online is valuable. It's driving the $500 billion data economy. Want to get your share? </p>
			</div>
		</div>
		<div class="o-grid-row">
			<div data-o-grid-colspan="6">
				<button class="o-buttons o-buttons--big subscription-prompt--pwr__button">Tell me more</button>
			</div>
			<div data-o-grid-colspan="6">
				<button class="o-buttons o-buttons--big o-buttons--standout subscription-prompt--pwr__button">Yes</button>
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
	console.log("here 1");
	return shouldPromptBeShown(flags)
		.then(shouldShow => {
			console.log("here 3");
			if (shouldShow) {
				return createPrompt();
				console.log("here 4");
			}
		})
		.catch(error => {
			console.log(error);
			broadcast('oErrors.log', {
				error,
				info: {
					message: 'Error initialising Pwr Of You Prompt'
				}
			})
		});
}
