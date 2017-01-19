const semver = require('semver');

module.exports = function () {

	let tag = process.env.CIRCLE_TAG;
	let versions;
	let isOfficialRelease = false;

	if (!tag) {
		versions = ['dummy-release'];
	} else if (!semver.valid(tag) || /(beta|rc)/.test(tag)) {
		versions = [tag];
	} else {
		isOfficialRelease = true;
		if (tag.charAt(0) !== 'v') {
			tag = `v${tag}`;
		}
		versions = [
			tag.split('.').slice(0, 1).join('.'),
			tag.split('.').slice(0, 2).join('.'),
			tag
		]
	}

	return {versions, isOfficialRelease}

}
