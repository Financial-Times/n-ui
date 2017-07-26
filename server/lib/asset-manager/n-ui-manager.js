const semver = require('semver');
const path = require('path');

let nUiBowerJson = {};

const getReleaseName = directory => {
	try {
		nUiBowerJson = require(path.join(directory || process.cwd(), 'bower_components/n-ui/.bower.json'));
	} catch (e) {}

	const nUiRelease = nUiBowerJson._release;

	if (!nUiRelease) {
		return 'dummy-release';
	} else if (!semver.valid(nUiRelease)) {
		// for non semver releases, use the tag in its entirety
		return nUiRelease;
	}	else if (/(beta|rc)/.test(nUiRelease)) {
		// for beta releases, prepend a v
		return 'v' + nUiRelease;
	} else {
		// for now we point at the full version (while n-ui is very much in flux)
		// this conditional is left here so that it's easier to see where to change to
		// point at a minor/major version if expedient in future
		return 'v' + nUiRelease;
	}
};

module.exports.getReleaseName = getReleaseName;
