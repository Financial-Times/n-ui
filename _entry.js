// for the purposes of exposing in a shared n-ui bundle
// This will mean webpack can find them in this bundle under n-ui/componentName
// Note - shoudl be kept up to date with _deploy/entry
module.exports =  {
	entryPoints: {
		ads: 'ads',
		tracking: 'tracking',
		date: 'date',
		header: 'header',
		promoMessages: 'promo-messages',
		cookieMessage: 'cookie-message',
		welcomeMessage: 'welcome-message',
		messagePrompts: 'message-prompts',
		myft: 'myft',
		utils: 'utils',
		configure: null,
		bootstrap: null
	}
};
