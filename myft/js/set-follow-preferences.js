'use strict';

const myFtApi = require('next-myft-client');

function addPref(uuid, userId) {
	//TODO: align client/server-side methods in client
	if (typeof myFtApi.addRelationship === 'function') {
		return myFtApi.addRelationship('user', userId, 'preferred', 'preference', { uuid });
	} else {
		return myFtApi.add('user', userId, 'preferred', 'preference', uuid, { uuid });
	}
}

module.exports = (userId, method, userDismissed) => {
	let emailPrefPromise = Promise.resolve();
	let dismissPrefPromise = Promise.resolve();

	if (method === 'put') {
		emailPrefPromise = addPref('email-daily-digest', userId);
	}

	if (userDismissed) {
		dismissPrefPromise = addPref('follow-email-dismissed', userId);
	}

	return Promise.all([emailPrefPromise, dismissPrefPromise]);
};
