//TODO: refactor the massive out of this

const nextButtons = require('../buttons');
const nNotification = require('../notification');
const Overlay = require('../overlay');
const myftClient = require('next-myft-client');
const Delegate = require('ftdomdelegate');

const delegate = new Delegate(document.body);
const pushNotifications = require('./js/push-notifications');
const grabUrlHashWithPrefix = require('./js/grab-url-hash-with-prefix');
const followEmail = require('./js/follow-email');
const uuid = require('../utils').uuid;
const $$ = require('../utils').$$

const subscribeUrl = '/products?segID=400863&segmentID=190b4443-dc03-bd53-e79b-b4b6fbd04e64';
const signInLink = '/login';

let flags;
let results = {};
let initialised;
let collectionPending = false;

const types = {
	saved: 'content',
	followed: 'concept',
	preferred: 'preference',
	contained: 'content'
};

const actors = {
	saved: 'user',
	followed: 'user',
	preferred: 'user',
	contained: 'list'
};

const uiSelectors = {
	saved: '[data-myft-ui="saved"]',
	followed: '[data-myft-ui="follow"]',
	preferred: '[data-myft-ui="prefer"]',
	contained: '[data-myft-ui="contained"]'
};

const idProperties = {
	saved: 'data-content-id',
	followed: 'data-concept-id',
	preferred: 'data-preference-name',
	contained: 'data-content-id'
};

const nNotificationMsgs = {
	followAnon: `Please <a href="${subscribeUrl}">subscribe</a> or <a href="${signInLink}">sign in</a> to follow this topic.`,
	saveAnon: `Please <a href="${subscribeUrl}">subscribe</a> or <a href="${signInLink}">sign in</a> to save this article.`,
	opted: 'You‘ve opted into our new site. You can return to FT.com at any time.'
};

function myFtFeatureFromEvent (ev) {
	return ev.type.replace('myft.', '').split('.')[1];
}

function getUuid (item) {
	return item.UUID || item.uuid;
}

function toggleButton (buttonEl, state) {
	const isPressed = buttonEl.getAttribute('aria-pressed') === 'true';

	if (state !== isPressed) {
		nextButtons.toggleState(buttonEl);
	}
	buttonEl.removeAttribute('disabled');
}


function updateUiForFeature (opts) {
	if (!uiSelectors[opts.myftFeature]) {
		return;
	}

	const featureForms = $$(uiSelectors[opts.myftFeature], opts.context);
	const idProperty = idProperties[opts.myftFeature];
	const uuids = opts.subjects.map(getUuid);

	// if there are multiple buttons, use the button with the same value as the rel property
	// if there are no multiple buttons, use opts.state
	featureForms.forEach(form => {
		const index = uuids.indexOf(form.getAttribute(idProperty));
		if (index > -1) {
			const relBtns = form.querySelectorAll('button[name^="_rel."]');
			const hasRelBtns = (relBtns.length > 0);
			let activeMultiButton;

			// if the form has _rel.foo buttons, but there is no _rel.foo in the subject object nor an 'off' ('delete') button, then go to next iteration
			// this is for when 1 item is changed on a page with > 1 form, and the returned rel object only has a property for the changed item
			if (hasRelBtns) {
				activeMultiButton = getActiveMultiButton(relBtns, form, opts.subjects[index]);
				if (!activeMultiButton) {
					return;
				}
			}

			$$('button', form).forEach(button => {
				const newButtonState = (hasRelBtns) ? (button === activeMultiButton) : opts.state;
				toggleButton(button, newButtonState);
			});
		}
	});
}

function getActiveMultiButton (relBtns, form, subject) {
	const relName = relBtns[0].getAttribute('name').replace('_rel.', '');
	const relValue = subject._rel && subject._rel[relName];
	// can remove delete button part once old myft alerts page is retired
	const activeButton = form.querySelector(`button[value="${relValue || 'delete'}"]`);
	return activeButton;
}

function openOverlay (html, { name = 'myft-ui', title = '&nbsp;', shaded = true }) {
	const overlay = new Overlay(name, {
		heading: { title, shaded },
		html
	});

	overlay.open();

	return new Promise(resolve => {
		document.body.addEventListener('oOverlay.ready', () => resolve(overlay));
	});
}

function setUpSaveToExistingListListeners (overlay, contentId) {

	const saveToExistingListButton = overlay.content.querySelector('.js-save-to-existing-list');
	const listSelect = overlay.content.querySelector('.js-list-select');

	if (saveToExistingListButton) {
		saveToExistingListButton.addEventListener('click', ev => {
			ev.preventDefault();

			if(!listSelect.value) {
				const nameFormGroup = overlay.content.querySelector('.js-uuid-group');
				nameFormGroup.className += ' o-forms--error n-myft-ui__error--no-name';
				return;
			}

			const listId = listSelect.options[listSelect.selectedIndex].value;
			myftClient.add('list', listId, 'contained', 'content', contentId)
				.then(detail => {
					updateAfterIO('contained', detail);
					overlay.close();
				});
		});
	}
}

function setUpNewListListeners (overlay, contentId) {

	const createListButton = overlay.content.querySelector('.js-create-list');
	const nameInput = overlay.content.querySelector('.js-name');
	const descriptionInput = overlay.content.querySelector('.js-description');

	createListButton.addEventListener('click', ev => {
		ev.preventDefault();

		if(!nameInput.value) {
			const nameFormGroup = overlay.content.querySelector('.js-name-group');
			nameFormGroup.className += ' o-forms--error n-myft-ui__error--no-name';
			return;
		}

		const createListData = {
			name: nameInput.value,
			description: descriptionInput.value
		};

		myftClient.add('user', null, 'created', 'list', uuid(), createListData)
			.then(detail => {
				if(contentId) {
					return myftClient.add('list', detail.subject, 'contained', 'content', contentId);
				} else {
					return detail;
				}

			})
			.then(detail => {
				if(contentId){
					updateAfterIO('contained', detail);
				}
				overlay.close();
			})
			.catch(err => {

				// TODO: this should use some formalised system for handling generic errors (context: https://github.com/Financial-Times/next-myft-ui/pull/65)
				nNotification.show({
					content: contentId ? 'Error adding article to new list' : 'Error creating new list',
					type: 'error'
				});
				throw err;
			});
	});

}

function showListsOverlay (overlayTitle, formHtmlUrl, contentId) {

	myftClient.personaliseUrl(formHtmlUrl)
		.then(url => fetch(url, {
			credentials: 'same-origin'
		}))
		.then(res => res.text())
		.then(html => openOverlay(html, { title: overlayTitle }))
		.then(overlay => {
			setUpSaveToExistingListListeners(overlay, contentId);
			setUpNewListListeners(overlay, contentId);
		});

}

function showCopyToListOverlay (contentId, excludeList) {
	showListsOverlay('Copy to list', `/myft/list?fragment=true&copy=true&contentId=${contentId}&excludeList=${excludeList}`, contentId)
}

function showArticleSavedOverlay (contentId, fromClippings) {
	showListsOverlay('Article saved', `/myft/list?fragment=true&fromArticleSaved=true&contentId=${contentId}${fromClippings && '&fromClippings=true'}`, contentId)
}

function showCreateListOverlay () {
	showListsOverlay('Create list', '/myft/list?fragment=true');
}

function getMessage (relationship, detail, href) {
	detail.data = detail.data || {};

	const messages = {
		followed:
			`<a href="/myft" class="myft-ui__logo" data-trackable="myft-logo"><abbr title="myFT" class="myft-ui__icon"></abbr></a>
			${detail.results ? 'You are following' : 'You unfollowed'} <b>${detail.data.name}</b>.
			<a href="${href}" data-trackable="alerts">Manage topics</a>`,
		saved:
			`<a href="/myft" class="myft-ui__logo" data-trackable="myft-logo"><abbr title="myFT" class="myft-ui__icon"></abbr></a>
			${detail.results ? 'Article added to your' : 'Article removed from your'}
			<a href="${href}" data-trackable="saved-cta">saved articles</a>`,
		contained:
			`<a href="/myft" class="myft-ui__logo" data-trackable="myft-logo"><abbr title="myFT" class="myft-ui__icon"></abbr></a>
			${detail.results ? `Article added to your list.
			<a href="${href}" data-trackable="alerts">View list</a>` : 'Article removed from your list'}`
	};

	return (messages.hasOwnProperty(relationship)) ? messages[relationship]: '';
}

function getPersonaliseUrlPromise (page, relationship, detail) {
	return myftClient.personaliseUrl(`/myft/${page}`)
		.then(personalisedUrl => ({
			type: 'default',
			message: getMessage(relationship, detail, personalisedUrl)
		}));
}

function updateAfterIO (myftFeature, detail) {

	updateUiForFeature({
		myftFeature,
		subjects: [{ uuid: detail.subject, '_rel': detail.data && detail.data._rel }],
		state: !!detail.results
	});

	let messagePromise = Promise.resolve({});

	switch (myftFeature) {
		case 'followed':
			if (flags.get('myFtFollowEmail') && detail.results && !collectionPending) {

				if (!followEmail.prefs.subscribedToDigest && !followEmail.prefs.userDismissed && detail.data.name) {

					return myftClient.personaliseUrl(`/myft/api/onsite/follow-email/form?fragment=true&name=${encodeURIComponent(detail.data.name)}`)
						.then(url => fetch(url, { credentials: 'same-origin' }))
						.then(res => res.text())
						.then(html => openOverlay(html, {
							name: 'myft-follow',
							shaded: false
						}))
						.then(overlay => followEmail.setUpOverlayListeners(overlay))
						.catch(err => console.log(err));

				}
			}
			break;
		case 'saved':
			if (flags.get('myftLists') && detail.results) {
				messagePromise = myftClient.getAll('created', 'list')
					.then(createdLists => createdLists.filter(list => !list.isRedirect))
					.then(createdLists => {
						if (createdLists.length) {
							showArticleSavedOverlay(detail.subject);
							return {message: null};
						}
						return {};
					});
			}
			break;
		case 'contained':
			messagePromise = getPersonaliseUrlPromise(`list/${detail.actorId}`, 'contained', detail);
			break;
		case 'preferred':
			//FIXME: remove this and make myFtClient.loaded update after client-side changes
			if (detail.subject === 'email-digest') {
				followEmail.prefs.subscribedToDigest = true;
			} else if (detail.subject === 'follow-email-dismissed') {
				followEmail.prefs.userDismissed = true;
			}
			break;
	}

	messagePromise
		.then(({message = null, type = null}) => {
			if (!message) {
				return;
			}
			nNotification.show({
				content: message,
				type,
				trackable: 'myft-feedback-notification'
			});
		});

}

function onLoad (ev) {
	const myftFeature = myFtFeatureFromEvent(ev);
	results[myftFeature] = ev.detail.Items || ev.detail.items || [];

	//FIXME: remove this and make myFtClient.loaded update after client-side changes
	if (myftFeature === 'preferred') {
		followEmail.setInitialPrefs();
	}

	updateUiForFeature({
		myftFeature,
		subjects: results[myftFeature],
		state: true
	});
}

// extract properties with _rel. prefix into nested object, as expected by the API for relationship props
function extractMetaData(inputs) {
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

function getInteractionHandler (myftFeature) {
	return function (ev, el) {
		ev.preventDefault();

		const buttonWithValTriggered = !!(el.tagName.toLowerCase() === 'button' && el.name && el.value);
		const activeButton = (buttonWithValTriggered) ? el : el.querySelector('button');
		const form = (buttonWithValTriggered) ? el.closest('form') : el;
		const formButtons = (buttonWithValTriggered) ? $$('button', form) : [activeButton];

		if (formButtons.some((button) => button.hasAttribute('disabled'))) {
			return;
		}

		formButtons.forEach((button) => button.setAttribute('disabled', ''));

		const isPressed = activeButton.getAttribute('aria-pressed') === 'true';

		let action;
		if (buttonWithValTriggered) {
			action = (activeButton.value === 'delete') ? 'remove' : 'add';
		} else {
			action = (isPressed) ? 'remove' : 'add';
		}

		const id = form.getAttribute(idProperties[myftFeature]);
		const type = types[myftFeature];
		const hiddenFields = $$('input[type="hidden"]', form);
		const metaFields = (buttonWithValTriggered) ? [activeButton, ...hiddenFields] : hiddenFields;

		let meta = extractMetaData(metaFields);

		if (~['add', 'remove'].indexOf(action)) {
			const actorId = form.getAttribute('data-actor-id');

			if (type === 'concept') {
				const conceptIds = id.split(',');
				const taxonomies = meta.taxonomy.split(',');
				const names = meta.name.split(',');

				// Prevents the email overlay from triggering if there are bulk follow actions
				if (conceptIds.length > 1) {
					collectionPending = true;
				}

				const followPromises = conceptIds.map((conceptId, i) => {
					const singleMeta = Object.assign({}, meta, {
						name: names[i],
						taxonomy: taxonomies[i]
					});
					return myftClient[action](actors[myftFeature], actorId, myftFeature, type, conceptId, singleMeta);
				});

				Promise.all(followPromises)
					.then(() => toggleButton(activeButton, action === 'add'))
					.catch(() => {})
					.then(() => collectionPending = false)

			} else {
				myftClient[action](actors[myftFeature], actorId, myftFeature, type, id, meta);
			}

		} else {
			myftClient[action](myftFeature, type, id, meta);
		}
	};
}

export function init (opts) {
	if (initialised) {
		return;
	}
	initialised = true;
	flags = opts.flags;

	grabUrlHashWithPrefix('myft:notification:')
		.then(messageKey => {
			if (!messageKey || !nNotificationMsgs.hasOwnProperty(messageKey)) { return; }
			nNotification.show({
				content: nNotificationMsgs[messageKey],
				type: 'clippings',
				duration: 0
			});
		});

	grabUrlHashWithPrefix('myft:list-overlay:')
		.then(messageKey => {
			if (messageKey === 'clippings') {
				const matches = window.location.pathname.match(/^\/content\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);
				if (matches && matches.length) {
					showArticleSavedOverlay(matches[1], true);
				}
			}
		});

	if (opts && opts.anonymous) {
		['follow', 'save'].forEach(action => {
			delegate.on('submit', `.n-myft-ui--${action}`, ev => {
				ev.preventDefault();
				nNotification.show({ content: nNotificationMsgs[`${action}Anon`] });
			});
		});
	} else {
		personaliseLinks();

		Object.keys(uiSelectors).forEach(myftFeature => {
			if (myftClient.loaded[`myftFeature.${types[myftFeature]}`]) {
				results[myftFeature] = myftClient.loaded[`myftFeature.${types[myftFeature]}`];

				updateUiForFeature({
					myftFeature,
					subjects: results[myftFeature],
					state: true
				});

				//FIXME: remove this and make myFtClient.loaded update after client-side changes
				if (myftFeature === 'preferred') {
					followEmail.setInitialPrefs();
				}

			} else {
				document.body.addEventListener(`myft.user.${myftFeature}.${types[myftFeature]}.load`, onLoad);
			}
			document.body.addEventListener(`myft.${actors[myftFeature]}.${myftFeature}.${types[myftFeature]}.add`, ev => updateAfterIO(myFtFeatureFromEvent(ev), ev.detail));
			document.body.addEventListener(`myft.${actors[myftFeature]}.${myftFeature}.${types[myftFeature]}.remove`, ev => updateAfterIO(myFtFeatureFromEvent(ev), ev.detail));

			delegate.on('submit', uiSelectors[myftFeature], getInteractionHandler(myftFeature));
		});

		delegate.on('click', '.n-myft-ui--prefer-group button', getInteractionHandler('preferred'));

		//copy from list to list
		delegate.on('click', '[data-myft-ui="copy-to-list"]', ev => {
			ev.preventDefault();
			showCopyToListOverlay(ev.target.getAttribute('data-content-id'), ev.target.getAttribute('data-actor-id'));
		});

		delegate.on('click', '[data-myft-ui="create-list"]', ev => {
			ev.preventDefault();
			showCreateListOverlay();
		});

		pushNotifications.init(opts.pushNotifications);
	}
}

export function	updateUi (el, ignoreLinks) {
	if (!ignoreLinks) {
		personaliseLinks(el);
	}

	Object.keys(uiSelectors).forEach(myftFeature => {
		if (!results[myftFeature]) {
			return;
		}

		updateUiForFeature({
			myftFeature,
			subjects: results[myftFeature],
			state: true,
			context: el
		});
	});
}

export function personaliseLinks (el) {
	const links = (el && el.nodeName === 'A') ? [el] : $$('a[href^="/myft"]', el);
	links.forEach(link => {
		myftClient.personaliseUrl(link.getAttribute('href'))
			.then(personalisedUrl => link.setAttribute('href', personalisedUrl));
	});
}
