import SlidingPopup from 'n-sliding-popup';
import {
	noneTrue, resultExists, executeWhen,
	getStorage, getSessionStorage, setStorage, getCookie,
	dateInFuture, addToDate,
	elementExists, createElement,
} from './utils';

const nowPlusThirtyDays = () => addToDate(2592000000)(Date.now);
const isBarrierPage = elementExists('.ft-subscription-panel');
const getFTSessionCookie = getCookie('FTSession');
const isLoggedIn = resultExists(getFTSessionCookie);
const getPromptNextShowDate = getStorage('b2c-subscription-offer-prompt');
const setPromptNextShowDate = setStorage('b2c-subscription-offer-prompt');
const getBarrierLastSeenDate = getSessionStorage('last-seen-barrier');
const promptDateInFuture = dateInFuture(getPromptNextShowDate);
const barrierLastSeen = resultExists(getBarrierLastSeenDate);
const scheduleNextBarrier = () => setPromptNextShowDate(nowPlusThirtyDays().toJSON())
const promptShouldBeShown = () => barrierLastSeen() && noneTrue(promptDateInFuture, isLoggedIn, isBarrierPage);
const popupTemplate = `
	<article class="subscription-prompt--wrapper">
		<div class="subscription-prompt--header">
			<span class="subscription-prompt--flag">Limited Offer</span>
			<h1 class="subscription-prompt--heading">You qualify for a 25% subscription discount</h1>
			<span class="subscription-prompt--subheading">
				<span class="ShownOn-desktop">Pay just £4.84 per week and you will get:</span>
				<span class="ShownOn-mobile">Pay just £4.84 per week and get unlimited access</span>
			</span>
		</div>
		<div class="subscription-prompt--info">
			<ul class="subscription-prompt--benefits-list ShownOn-desktop">
				<li>Full digital access: online, mobile & tablet</li>
				<li>5 year company financials archive</li>
				<li>Unlimited FT.com article access</li>
			</ul>
			<a href="https://subscription.ft.com/?cpgId=0504&segID=100893&offerId=c1773439-53dc-df3d-9acc-20ce2ecde318&segmentID=bbc74ab1-1054-329e-ec4c-1c614f6af5ba" class="subscription-prompt--subscribe-btn" data-trackable="subscribe">Save 25% now</a>
		</div>
		<div class="subscription-prompt--aside ShownOn-desktop">
			<figure class="subscription-prompt--figure">
				<img src="https://image.webservices.ft.com/v1/images/raw/http://next-geebee.ft.com/assets/people/lionel.png?source=test&width=126" alt="Lionel Barber, Editor">
				<figcaption class="subscription-prompt--figure-caption">Lionel Barber, Editor</span>
			</figure>
		</div>
	</article>
`;

function createPopupHTML () {
	return createElement('div', {
		'class': 'n-sliding-popup SubscriptionPrompt',
		'data-n-component': 'o-sliding-popup',
		'data-n-sliding-popup-position': 'bottom left',
	}, popupTemplate);
}

function createSubscriptionPrompt (html) {
	return () => {
		const element = html();
		element.onClose = scheduleNextBarrier;
		document.body.appendChild(element);
		const slidingPopup = new SlidingPopup(element);
		setTimeout(() => slidingPopup && slidingPopup.open && slidingPopup.open(), 2000);
		return slidingPopup;
	};
}

export const initPrompt = executeWhen(createSubscriptionPrompt(createPopupHTML));
export const init = () => initPrompt(promptShouldBeShown);
