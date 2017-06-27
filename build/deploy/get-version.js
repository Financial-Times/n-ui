const semver = require('semver');

module.exports = function () {

	let tag = process.env.CIRCLE_TAG;
	let version;
	let isOfficialRelease = false;

	if (!tag) {
		version = 'dummy-release';
	} else if (!semver.valid(tag) || /(beta|rc)/.test(tag)) {
		version = tag;
	} else {
		isOfficialRelease = true;
		if (tag.charAt(0) !== 'v') {
			tag = `v${tag}`;
		}
		version = tag;
	}
	return {version, isOfficialRelease};
};
