const IOS_DEVICE_REGEX = /OS [0-9]{1,2}(_[0-9]){1,2} like Mac OS X/i;
const ANDROID_DEVICE_REGEX = /Android (\d+(?:\.\d+)+)/i;

function isWebAppCapableDevice (userAgent) {
	return IOS_DEVICE_REGEX.test(userAgent);
}

function isModernAndroidDevice (userAgent) {
	const results = ANDROID_DEVICE_REGEX.exec(userAgent);

	if (!results) {
		return false;
	}

	const version = results[1].split('.').map(a => parseInt(a, 10));

	if (version[0] > 4) {
		return true;
	} else if(version[0] === 4 && version[1] > 2) {
		return true;
	} else {
		return false;
	}
}

module.exports = {
	isWebAppCapableDevice,
	isModernAndroidDevice
};
