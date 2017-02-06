import CookieMessage from 'o-cookie-message';

export default flags => {
	if (flags.get('cookieMessage')) {
		CookieMessage.init();
	}
};
