import SlidingPopup from 'n-sliding-popup';
import Superstore from 'superstore'

import * as utils from './utils';
import { broadcast } from 'n-ui-foundations';
import { getCountryCode } from './countryApi'

const promptLastSeenStorage = new Superstore('local', 'n-ui.subscription-offer-pwr-of-you');
const lionelLastSeenStorage = new Superstore('local', 'n-ui.subscription-offer-prompt');

const promptLastSeenStorageKey = 'last-closed-pwr';
const lionelLastSeenStorageKey = 'last-closed';

const getPromptLastClosed = () => promptLastSeenStorage.get(promptLastSeenStorageKey);

const getLionelLastClosed = () => lionelLastSeenStorage.get(lionelLastSeenStorageKey);

const setPromptLastClosed = () => promptLastSeenStorage.set(promptLastSeenStorageKey, Date.now());

/**
 * Show the prompt if
 *	* the prompt has not been closed, or was last closed more than 30 days ago
 *	* country code is USA or GBR
 *	* PowrOfYouSlider flag is true
 *	* The lionel slider has been closed at least once (lionelLastSeenStorageKey exists)
 */
const shouldPromptBeShown = (flags) => {
	return Promise.all([
			getPromptLastClosed(),
			getLionelLastClosed(),
			getCountryCode(),
		]).then(([promptLastClosed, lionelLastClosed, getCountryCode]) => {
			return (!!lionelLastClosed
			&& (getCountryCode === 'GBR' || getCountryCode === 'USA')
			&& (!promptLastClosed || promptLastClosed + (1000 * 60 * 60 * 24 * 30) <= Date.now())
			&& flags.get('PowerOfYouSlider'));
		});
};

const popupTemplate = () => `
	<aside class="subscription-prompt--pwr" data-trackable="subscription-offer-pwr-of-you">
		<button class="n-sliding-popup-close" data-n-component="n-sliding-popup-close" data-trackable="close">
			<span class="n-sliding-popup-close-label">Close</span>
		</button>
		<div class="o-grid-row">
			<div data-o-grid-colspan="5">
				<img class="subscription-prompt--pwr__img" src="https://www.ft.com/__origami/service/image/v2/images/raw/https%3A%2F%2Fgithub.com%2FFinancial-Times%2Fnext-assets%2Fblob%2Fmaster%2Fpublic-src%2Fthird-party%2FPowr-of-You-Logo_3600w.png%3Fraw%3Dtrue?source=next&width=250" alt=""role="presentation" aria-hidden="true">
			</div>
			<div data-o-grid-colspan="7"></div>
		</div>
		<div class="o-grid-row subscription-prompt--pwr__lead">
			<div data-o-grid-colspan="12">
				<p> Everyone takes your data. </p>
				<p> Time for <span class="subscription-prompt--pwr__lead__highlight">you</span> to take control</p>
			</div>
		</div>
		<div class="o-grid-row">
			<div data-o-grid-colspan="12" class="subscription-prompt--pwr__main">
				<p> Your time online is valuable. It's driving the $210 billion data economy. Want to get your share? </p>
			</div>
		</div>
		<div class="o-grid-row">
			<div data-o-grid-colspan="6">
				<a class="o-buttons subscription-prompt--pwr__button" data-trackable="pwr_tell-me-more" href="https://www.powrofyou.com/?utm_source=ext&utm_campaign=ft">Tell me more </a>
			</div>
			<div data-o-grid-colspan="6">
				<a class="o-buttons o-buttons--big o-buttons--standout subscription-prompt--pwr__button subscription-prompt--pwr__button--standout" data-trackable="pwr_sign-up" href="https://www.powrofyou.com/JoinUs?utm_source=ext&utm_campaign=ft">Yes</a>
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
				let test = createPrompt();
				return test;
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
