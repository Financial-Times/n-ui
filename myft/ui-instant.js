/*
* ui for instant alerts buttons
* ui.js has become so complex that we are splitting instant alerts into its own file until it gets refactored
*/

const nextButtons = require('../buttons');
const nNotification = require('../notification');
const Delegate = require('ftdomdelegate');
const myftClient = require('next-myft-client');

const delegate = new Delegate(document.body);
const $ = require('../utils').$
const $$ = require('../utils').$$
const subscribeUrl = '/products?segID=400863&segmentID=190b4443-dc03-bd53-e79b-b4b6fbd04e64';
const signInLink = '/login';

const UI_HOOK = '[data-myft-ui="instant"]';
let config;

// until API is updated to return modelled response data from create calls, fallback to old raw format
function apiBackwardsCompatibility (response) {
	return (response._rel) ? response._rel.instant : response.results[0].rel.properties.instant;
}

function updateConceptData (actorId, subjectId, data) {
	myftClient.updateRelationship('user', actorId, 'followed', 'concept', subjectId, data);
}

function toggleButton (buttonEl, state) {
	const isPressed = buttonEl.getAttribute('aria-pressed') === 'true';

	if (state !== isPressed) {
		nextButtons.toggleState(buttonEl);
	}
	buttonEl.removeAttribute('disabled');
	buttonEl.setAttribute('value', !state);
}

function updateButtons (subjectId, newState) {
	const affectedButtons = $$(`${UI_HOOK}[data-concept-id="${subjectId}"] button`);
	affectedButtons.forEach((button) => {
		toggleButton(button, newState);
	});
}

function conceptRemoved (conceptData) {
	updateButtons(conceptData.subject, false);
}

function conceptUpdated (conceptData) {
	const newState = apiBackwardsCompatibility(conceptData);
	updateButtons(conceptData.subject, newState);
}

function showAnonNotification () {
	nNotification.show({
		content: `Please <a href="${subscribeUrl}" data-trackable="Subscribe">subscribe</a> or <a href="${signInLink}" data-trackable="Sign In">sign in</a> to receive instant alerts.`,
		trackable: 'myft-anon'
	});
}

function extractMetaData (inputs) {
	const meta = {};

	inputs.forEach((input) => {
		if (input.name.startsWith('_rel.')) {
			const key = input.name.slice('_rel.'.length);
			meta._rel = meta._rel || {};
			meta._rel[key] = input.value;

		} else if (input.type === 'hidden') {
			meta[input.name] = input.value;
		}
	});

	return meta;
}

function formSubmitted (event, element) {
	event.preventDefault();
	if (config && config.anonymous) {
		showAnonNotification();
	} else {
		const subjectId = element.getAttribute('data-concept-id');
		const actorId = element.getAttribute('data-actor-id');
		const submitEl = $('button', element);
		const inputs = $$('input', element);
		inputs.push(submitEl);
		updateConceptData(actorId, subjectId, extractMetaData(inputs));
	}
}

function eventListeners () {
	document.body.addEventListener('myft.user.followed.concept.remove', ev => conceptRemoved(ev.detail));
	document.body.addEventListener('myft.user.followed.concept.update', ev => conceptUpdated(ev.detail));
	delegate.on('submit', `${UI_HOOK}`, formSubmitted);
}

// delegate is listening to the whole body therefore events look for forms across the whole page rather than setting up instances
// if we used instances we could reduce the amount of DOM queries that we do
export function init (opts) {
	const instantAlertForms = $$(UI_HOOK);
	config = opts;
	if (instantAlertForms.length > 0) {
		eventListeners();
	}
}
