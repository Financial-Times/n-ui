const _myFtClient = require('next-myft-client');
const _setFollowPreferences = require('./set-follow-preferences');

//TODO: clean up on overlay close

let _overlayForm;

//FIXME: remove this and make myFtClient.loaded update after client-side changes
let prefs = {
	subscribedToDigest: null,
	userDismissed: null
};

function setInitialPrefs () {
	const allLoadedPrefs = _myFtClient.loaded['preferred.preference'].items;

	prefs.subscribedToDigest = allLoadedPrefs.find(pref => pref.uuid === 'email-digest');
	prefs.userDismissed = allLoadedPrefs.find(pref => pref.uuid === 'follow-email-dismissed');
}

function _overlayFormHandler (ev, overlay) {
	ev.preventDefault();
	// Default for users who hit enter
	let method = 'put';

	if (ev.currentTarget.tagName.toLowerCase() === 'button') {
		method = ev.currentTarget.value;
	}

	_setFollowPreferences(_myFtClient.userId, method, _overlayForm['follow-email-dismissed'].checked)
		.catch(() => null)
		.then(() => overlay.close());
}

function setUpOverlayListeners (overlay) {
	_overlayForm = (overlay) ? overlay.content.querySelector('.js-follow-email-form') : null;

	if (!_overlayForm) { return; }

	_overlayForm.addEventListener('submit', ev => {
		_overlayFormHandler(ev, overlay);
	});

	[..._overlayForm.querySelectorAll('button')]
		.forEach(el => el.addEventListener('click', ev => {
			_overlayFormHandler(ev, overlay);
		}));
}

module.exports = {
	prefs,
	setInitialPrefs,
	setUpOverlayListeners
};
