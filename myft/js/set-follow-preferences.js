const myFtApi = require('next-myft-client');
const relData = {
	timezone: 'Europe/London',
	type: 'daily'
};

function addPref (uuid, userId, rel) {
	const data = {};

	if (rel) {
		data._rel = rel;
	}

	//TODO: align client/server-side methods in client
	if (typeof myFtApi.addRelationship === 'function') {
		return myFtApi.addRelationship('user', userId, 'preferred', 'preference', Object.assign({}, data, { uuid }));
	} else {
		return myFtApi.add('user', userId, 'preferred', 'preference', uuid, data);
	}
}

module.exports = (userId, method, userDismissed) => {
	let emailPrefPromise = Promise.resolve();
	let dismissPrefPromise = Promise.resolve();

	if (method === 'put') {
		emailPrefPromise = addPref('email-digest', userId, relData);
	}

	if (userDismissed) {
		dismissPrefPromise = addPref('follow-email-dismissed', userId);
	}

	return Promise.all([emailPrefPromise, dismissPrefPromise]);
};
