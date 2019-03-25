const oTracking = require('o-tracking');

const audioTeaserView = {
	init: (selector) => {
		const getContentIdFromXTeaser = el => el.getAttribute('data-id');
		const getContentIdFromNTeaser = el => el.querySelector('.o-teaser__heading a').getAttribute('data-content-id');

		oTracking.view.init({
			selector: selector || '.o-teaser--audio',
			getContextData: (el) => {
				return {
					componentContentId: getContentIdFromXTeaser(el) || getContentIdFromNTeaser(el),
					component: 'teaser',
					type: 'audio',
					subtype: 'podcast', // only podcast is audio subtype at 03/2019. Need to change when audio has more subtypes.
				};
			}
		});
	}
};

module.exports = audioTeaserView;
