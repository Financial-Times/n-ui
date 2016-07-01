'use strict';
const path = require('path');
let version = false;
let majorVersion;
let versionType = 'none';
let nUiConfig;

try {
	version = require(path.join(process.cwd(), 'bower_components/n-ui/.bower.json')).version;

	if (/(beta|rc)/.test(version)) {
		versionType = 'beta';
	} else {
		versionType = 'semver';
		version = version.split(".").slice(0,2).join('.');
		majorVersion = version.split('.').slice(0,1)[0];
	}

} catch (e) {}

try {
	nUiConfig = require(path.join(process.cwd(), 'client/n-ui-config'))
} catch (e) {}

module.exports = function (req, res, next) {

	if (res.locals.flags.nUiBundle) {
		res.locals.nUiVersion = 'v' + ((versionType === 'semver' && res.locals.flags.nUiBundleMajorVersion) ? majorVersion : version);
		res.locals.nUiConfig = nUiConfig;
	}

	next()
};
