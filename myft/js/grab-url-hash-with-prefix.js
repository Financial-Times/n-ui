let initialized = false;
let supportsHistory;

function removeHash () {
	const loc = window.location;
	const body = document.body;
	let scrollV;
	let scrollH;

	if (supportsHistory)
		history.replaceState('', document.title, loc.pathname + loc.search);
	else {
		// flicker-free solution for <=IE9
		scrollV = body.scrollTop;
		scrollH = body.scrollLeft;
		loc.hash = '';
		body.scrollTop = scrollV;
		body.scrollLeft = scrollH;
	}
}

module.exports = (hashPrefix) => {
	if (!initialized) {
		supportsHistory = window.history && 'replaceState' in history;
	}
	initialized = true;

	const hash = location.hash.substring(1);
	const startsWithPrefix = hash && hash.indexOf(hashPrefix) === 0;
	const messageKey = hash.substring(hashPrefix.length);

	if (startsWithPrefix) {
		removeHash();
		return Promise.resolve(messageKey);
	} else {
		return Promise.resolve();
	}
}
