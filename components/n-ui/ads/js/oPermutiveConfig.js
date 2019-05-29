/**
 * Return a configuration object for o-permutive module
 *
 * @param {String} appName Name of the app loading n-ui
 * @param {String} contentId UUID of article page
 */
export function getOPermutiveConfig (appName, contentId = null) {
	return {
		appInfo : {
			appName : appName,
			contentId : contentId
		},
		publicApiKeys : {
			id : 'e1c3fd73-dd41-4abd-b80b-4278d52bf7aa',
			key : 'b2b3b748-e1f6-4bd5-b2f2-26debc8075a3'
		}
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
export function getOPermutiveMetaData (appName, kruxMeta, contentId = null) {
	let pageMeta = {};
	let userMeta = {};

	const kruxUserMeta = kruxMeta.user;

	if(appName === 'article') {
		const kruxPageMeta = kruxMeta.page;

		if(contentId) {
			pageMeta.id = contentId;
		}

		if(kruxPageMeta) {
			const type = Array.isArray(kruxPageMeta.genre) && kruxPageMeta.genre.length > 0 ? kruxPageMeta.genre[0] : null;

			pageMeta = {
					id: contentId,
					type: type,
					organisations: kruxPageMeta.organisations,
					people: kruxPageMeta.people,
					categories: kruxPageMeta.ca,
					authors: kruxPageMeta.authors,
					topics: kruxPageMeta.topics,
					admants: kruxPageMeta.ad
			};
		}
	}

	if(kruxUserMeta) {
		userMeta = {
			industry: kruxUserMeta.industry,
			position: kruxUserMeta.job_position,
			responsibility: kruxUserMeta.job_responsibility
		};
	}


	return {
		type: appName,
		article: pageMeta,
		user: userMeta
	};
}
