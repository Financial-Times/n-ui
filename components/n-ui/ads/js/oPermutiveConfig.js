/**
 * Return a configuration object for o-permutive module
 *
 * @param {String} appName Name of the app loading n-ui
 * @param {String} contentId UUID of article page
 */
export function getOPermutiveConfig () {
	return {
		projectId: 'e1c3fd73-dd41-4abd-b80b-4278d52bf7aa',
		publicApiKey : 'b2b3b748-e1f6-4bd5-b2f2-26debc8075a3', // public, it's ok, don't panic.
		consentFtCookie: true
	};
}

/**
 * Get meta data about the user and current page and format it for o-permutive
 *
 * Note: This is currently done by accessing the properties set by o-ads and krux.
 * This should change so that the fetch to the ads-api is done first, and the data passed
 * to o-ads and o-permutive respectively.
 *
 * @param {String} appName Name of the app loading n-ui
 */
export function getOPermutiveMetaData (appName, permMeta, contentId = null) {
	let pageMeta = {};
	let userMeta = {};

	//const permUserMeta = permMeta && permMeta.user;

	if(appName === 'article') {
		//const permPageMeta = permMeta.page;

		if(permMeta && permMeta.page) {
			const type = Array.isArray(permMeta.page.genre) && permMeta.page.genre.length > 0 ? permMeta.page.genre[0] : null;
			pageMeta = {
				id: contentId,
				type: type,
				organisations: permMeta.page.organisations,
				people: permMeta.page.people,
				categories: permMeta.page.ca,
				authors: permMeta.page.authors,
				topics: permMeta.page.topics,
				admants: permMeta.page.ad
			};
		}
	}

	if(permMeta && permMeta.user) {
		userMeta = {
			industry: permMeta.user.industry,
			position: permMeta.user.job_position,
			responsibility: permMeta.user.job_responsibility,
			gender: permMeta.user.gender,
			subscriptionLevel: permMeta.user.subscription_level,
			indb2b: permMeta.user.indb2b
		};
	}

	return {
		page: {
			type: appName,
			article: pageMeta,
			user: userMeta
		}
	};
}
