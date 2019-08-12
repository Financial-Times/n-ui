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
 * The data is first fetched from the ads-api, and then passed
 * to o-ads and o-permutive respectively.
 *
 * @param {String} appName Name of the app loading n-ui
 */
export function getOPermutiveMetaData (appName, targetingData, contentId = null) {
	let pageMeta = {};
	let userMeta = {};

	const inputUserMeta = targetingData.user;

	if (appName === 'article') {
		const inputPageMeta = targetingData.content;

		if (inputPageMeta) {
			const type = Array.isArray(inputPageMeta.genre) && inputPageMeta.genre.length > 0 ? inputPageMeta.genre[0] : null;

			pageMeta = {
				id: inputPageMeta.uuid || contentId,
				type: type,
				organisations: inputPageMeta.organisation,
				people: inputPageMeta.person,
				categories: inputPageMeta.categories,
				authors: inputPageMeta.person,
				topics: inputPageMeta.topic,
				admants: inputPageMeta.admants,
			};
		}
	}

	if (inputUserMeta) {
		userMeta = {
			industry: inputUserMeta.industry && inputUserMeta.industry.code,
			position: inputUserMeta.position && inputUserMeta.position.code,
			responsibility: inputUserMeta.responsibility && inputUserMeta.responsibility.code,
			gender: inputUserMeta.hui && inputUserMeta.hui.gender,
			subscriptionLevel: inputUserMeta.subscriptionLevel,
			indb2b: inputUserMeta.hui && inputUserMeta.hui.indb2b,
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
