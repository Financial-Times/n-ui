import SlidingPopup from 'n-sliding-popup';
import {
	noneTrue, result, resultExists, executeWhen,
	getStorage, getSessionStorage, setStorage, getCookie,
	dateInFuture, addToDate,
	elementExists, createElement,
	toCurrency
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
const popupTemplate = ({ discount, price, offerId }) => `
	<article class="subscription-prompt--wrapper" data-trackable="subscription-offer-prompt">
		<button class="n-sliding-popup-close" data-n-component="n-sliding-popup-close" data-trackable="close">
			<span class="n-sliding-popup-close-label">Close</span>
		</button>
		<div class="subscription-prompt--header">
			<span class="subscription-prompt--flag">Limited Offer</span>
			<h1 class="subscription-prompt--heading">You qualify for a ${discount}% subscription discount</h1>
			<span class="subscription-prompt--subheading">
				Pay just ${price} per week and get unlimited access
			</span>
		</div>
		<div class="subscription-prompt--info">
			<ul class="subscription-prompt--benefits-list">
				<li>Full digital access: online, mobile & tablet</li>
				<li>5 year company financials archive</li>
				<li>Unlimited FT.com article access</li>
			</ul>
			<a href="https://www.ft.com/signup?offerId=${offerId}" class="subscription-prompt--subscribe-btn" data-trackable="subscribe">Save 25% now</a>
		</div>
		<div class="subscription-prompt--aside">
			<figure class="subscription-prompt--figure">
				<img src="https://image.webservices.ft.com/v1/images/raw/http://next-geebee.ft.com/assets/people/lionel.png?source=test&width=126" alt="Lionel Barber, Editor">
				<figcaption class="subscription-prompt--figure-caption">Lionel Barber, Editor</span>
			</figure>
		</div>
	</article>
`;

function createPopupHTML (values) {
	return createElement('div', {
		'class': 'n-sliding-popup subscription-prompt',
		'data-n-component': 'o-sliding-popup',
		'data-n-sliding-popup-position': 'bottom left',
	}, popupTemplate(values));
}

function createSubscriptionPrompt (html, values) {
	return () => {
		const element = html(result(values));
		element.onClose = scheduleNextBarrier;
		document.body.appendChild(element);
		const slidingPopup = new SlidingPopup(element);
		setTimeout(() => slidingPopup && slidingPopup.open && slidingPopup.open(), 2000);
		return slidingPopup;
	};
}

let countryCode = 'GBR';
function setCountryCode (code) {
	countryCode = code;
	return code;
}
function getCountryCode () {
	return countryCode;
}

function getSubscriptionPromptValues () {
	switch (getCountryCode()) {
		// Australia
		case 'AUS': return { discount: 25, offerId: '123', price: toCurrency(479, 'AUD') };
		// United Kingdom
		case 'GBR': return { discount: 25, offerId: '123', price: toCurrency(399, 'GBP') };
		// Hong Kong
		case 'HKG': return { discount: 25, offerId: '123', price: toCurrency(3690, 'HKD') };
		// Japan
		case 'JPN': return { discount: 25, offerId: '123', price: toCurrency(65300, 'JPN') };
		// Singapore
		case 'SGP': return { discount: 25, offerId: '123', price: toCurrency(619, 'SGP') };
		// United States Minor Outlying Islands / United States of America
		case 'UMI':
		case 'USA': return { discount: 33, offerId: '123', price: toCurrency(470, 'USD') };
		// European countries
		case 'DEU':
		case 'FRA':
		case 'ITA':
		case 'ESP':
		case 'GRC':
		case 'PRT':
		case 'AUT':
		case 'CYP':
		case 'FIN':
		case 'IRL':
		case 'SVK':
		case 'MLT':
		case 'LVA':
		case 'SVN':
		case 'LTU':
		case 'EST':
		case 'BEL':
		case 'MCO':
		case 'UNK':
		case 'VAT':
		case 'ZWE':
		case 'AND':
		case 'SMR':
		case 'REU':
		case 'GLP':
		case 'MTQ':
		case 'BLM':
		case 'MYT':
		case 'ALA':
		case 'SPM':
		case 'NLD':
		case 'MAF': return { discount: 25, offerId: '123', price: toCurrency(439, 'EUR') };
		default: throw new Error(`unknown country code ${countryCode}`);
	}
}

export const initPrompt = executeWhen(createSubscriptionPrompt(createPopupHTML, getSubscriptionPromptValues));
export const init = () => fetch('/country')
	.then((response) => response.json())
	.then(setCountryCode)
	.then(() => initPrompt(promptShouldBeShown));
