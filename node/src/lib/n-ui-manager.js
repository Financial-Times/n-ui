const semver = require('semver');
const path = require('path');
let nUiBowerJson = {};

module.exports.init = (directory) => {
	try {
		nUiBowerJson = require(path.join(directory, 'bower_components/n-ui/.bower.json'))
	} catch (e) {}
}

let defaultUrlRoot;

function getUrlRoot (hashedAssets) {
	if (!defaultUrlRoot) {

		let nUiUrlRoot;
		const localAppShell = process.env.NEXT_APP_SHELL === 'local';
		// Attempt to get information about which version of n-ui is installed
		try {
			if (localAppShell) {
				nUiUrlRoot = hashedAssets.get('n-ui/');
			} else {
				const nUiRelease = nUiBowerJson._release;
				if (!semver.valid(nUiRelease)) {
					// for non semver releases, use the tag in its entirety
					nUiUrlRoot = nUiRelease;
				}	else if (/(beta|rc)/.test(nUiRelease)) {
					// for beta releases, prepend a v
					nUiUrlRoot = 'v' + nUiRelease;
				} else {
					// for normal semver releases prepend a v to the minor version
					nUiUrlRoot = 'v' + nUiRelease.split('.').slice(0, 2)[0]
				}
				nUiUrlRoot = `//www.ft.com/__assets/n-ui/cached/${nUiUrlRoot}/`;
			}

		} catch (e) {}
		defaultUrlRoot = nUiUrlRoot;
	}

	return defaultUrlRoot;

}

module.exports.getUrlRoot = getUrlRoot;
