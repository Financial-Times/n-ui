'use strict';
const path = require('path');
let version = false;
let versionType = 'none';

try {
	version = require(path.join(process.cwd(), 'bower_components/n-ui/.bower.json')).version;

	if (/(beta|rc)/.test(version)) {
		versionType = 'beta';
	} else {
		versionType = 'semver';
		version = version.split(".").slice(0,2).join('.');
	}

	version = 'v' + version;

} catch (e) {}

module.exports = function(req, res, next) {

	if (versionType === 'semver' && res.locals.flags.nUiBundleMajorVersion) {
		res.locals.nUiVersion = version.split('.').slice(0,1)[0];
	} else {
		res.locals.nUiVersion = version;
	}

	next()
};
