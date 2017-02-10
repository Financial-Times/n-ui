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
				return (!promptLastClosed || promptLastClosed + (1000 * 60 * 60 * 24 * 30) <= Date.now()) && flags.get('TODO_PWR_OF_YOU_FLAG_NAME');
			})
};

// TODO we'll move HTML out of here so it can be Pa11y'd
// OK for now to have it be the same as the lionel slider
const popupTemplate = () => `
	<aside class="subscription-prompt--wrapper subscription-prompt--pwr" data-trackable="subscription-offer-pwr-of-you">
		pwr of you HTML
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
