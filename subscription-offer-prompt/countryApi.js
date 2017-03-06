module.exports = {
	getCountryCode () {
		return fetch('/country', { credentials: 'same-origin' }).then(res => res.json());
	}
}
