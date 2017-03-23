const compactAdvertWelcomeBannerModel = {
	name: 'compact-ad',
	title: 'Try the new compact homepage.',
	strapline: 'A list view of today\'s homepage, with fewer images',
	ctas : {
		primary : {
			text: 'Try it now',
			href: '/viewtoggle/compact',
			trackable: 'viewtoggle | compact'
		}
	}
};

const compactViewEnabledWelcomeBannerModel = {
	name: 'compact-view',
	title: 'You\'ve enabled the compact homepage.',
	strapline: 'A list view of today\'s homepage, with fewer images',
	ctas : {
		primary : {
			text: 'Return to full view',
			href: '/viewtoggle/standard',
			trackable: 'viewtoggle | standard'
		}
	}
};

function welcomeBannerModelFactory (req, res, next) {
	if (res.locals.flags.compactView && req.path === '/' && !res.locals.anon.userIsAnonymous) {
		if (req.get('FT-Cookie-ft-homepage-view') === 'compact') {
			res.locals.welcomeBanner = compactViewEnabledWelcomeBannerModel;
		} else {
			res.locals.welcomeBanner = compactAdvertWelcomeBannerModel;
		}
	}

	next();
}

module.exports = welcomeBannerModelFactory;
module.exports._banners = { compactAdvertWelcomeBannerModel, compactViewEnabledWelcomeBannerModel };
