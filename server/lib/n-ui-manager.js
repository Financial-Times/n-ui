const semver = require('semver');
const path = require('path');

let nUiBowerJson = {};
let nUiUrlRoot;

const getReleaseName = directory => {
	try {
		nUiBowerJson = require(path.join(directory || process.cwd(), 'bower_components/n-ui/.bower.json'))
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
		return 'v' + nUiRelease
	}
}

const generateUrlRoot = (directory, hasher) => {
	const localAppShell = process.env.NEXT_APP_SHELL === 'local';
	// Attempt to get information about which version of n-ui is installed
	try {
		if (localAppShell) {
			nUiUrlRoot = hasher('n-ui/');
		} else {
			nUiUrlRoot = `//www.ft.com/__assets/n-ui/cached/${getReleaseName(directory)}/`;
		}

	} catch (e) {}
}



module.exports.init = (directory, hasher) => {
	generateUrlRoot(directory, hasher)
}

module.exports.getUrlRoot = () => nUiUrlRoot;

module.exports.getReleaseRoots = () => {
	const releaseName = getReleaseName();
	return [
		`https://www.ft.com/__assets/n-ui/cached/${releaseName}/`,
		`http://ft-next-n-ui-prod.s3-website-eu-west-1.amazonaws.com/__assets/n-ui/cached/${releaseName}/`,
		`http://ft-next-n-ui-prod-us.s3-website-us-east-1.amazonaws.com/__assets/n-ui/cached/${releaseName}/`
	]
}
