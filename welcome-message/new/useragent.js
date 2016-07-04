const IOS_DEVICE_REGEX = /OS (7|8|9|10).* like Mac OS X.*/i;
const ANDROID_DEVICE_REGEX = /Android (4\.[3-9]|[5-9])/i;

function isWebAppCapableDevice (userAgent) {
	return IOS_DEVICE_REGEX.test(userAgent);
}

function isModernAndroidDevice (userAgent) {
	return ANDROID_DEVICE_REGEX.test(userAgent);
}

module.exports = {
	isWebAppCapableDevice,
	isModernAndroidDevice
};
