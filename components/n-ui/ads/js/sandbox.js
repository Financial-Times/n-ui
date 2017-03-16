function sandbox () {
	return location.hash.indexOf('adsandbox') > -1;
}

module.exports.isActive = sandbox;
