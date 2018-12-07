const fetch = require('node-fetch');

module.exports = async function circleFetch (path, opts) {
	const defaultOptions = {
		timeout: 3000,
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		}
	};

	const circleToken = process.env.CIRCLECI_REBUILD_KEY;
	const options = Object.assign(defaultOptions, opts);
	const url = `https://circleci.com/api/v1.1/project/github/Financial-Times${path}?circle-token=${circleToken}`;

	const res = await fetch(url, options);

	if (res.ok) {
		return await res.json();
	} else {
		console.log(`Response not OK for ${path}, got: ${res.status}`); // eslint-disable-line no-console
		throw new Error(res.status);
	}
};
