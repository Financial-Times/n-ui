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
					// for now we point at the full version (while n-ui is very much in flux)
					// this conditional is left here so that it's easier to see where to change to
					// point at a minor/major version if expedient in future
					nUiUrlRoot = 'v' + nUiRelease
				}
				nUiUrlRoot = `//www.ft.com/__assets/n-ui/cached/${nUiUrlRoot}/`;
			}

		} catch (e) {}
		defaultUrlRoot = nUiUrlRoot;
	}

	return defaultUrlRoot;

}

module.exports.getUrlRoot = getUrlRoot;
