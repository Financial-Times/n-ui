const utils = require('./utils');
const metadata = require('ft-metadata');
const sandbox = require('./sandbox');
const extend = require('o-ads').utils.extend;
const pageType = utils.getAppName();

function getGPTUnitName (contextData) {
	let area = sandbox.isActive() ? ['5887', 'sandbox.next.ft'] : ['5887', 'ft.com'];
	let pageSpecific = [];
	if (contextData && contextData.dfp && contextData.dfp.adUnit) {
		pageSpecific = contextData.dfp.adUnit.filter(a => a);
	} else {
		pageSpecific = [ utils.getMetaData('dfp_site'), utils.getMetaData('dfp_zone') ].filter( a => a );
	}

	if(!pageSpecific.length) {
		pageSpecific = ['unclassified'];
	};

	return area.concat(pageSpecific).join('/');
};

function getLazyLoadConfig(flags) {
	switch(flags.adsLazyLoadPosition) {
		case 'onload':
			return false;
		case '50pc':
			return { viewportMargin: "0% 0% 50% 0%" };
		case '100pc':
			return { viewportMargin: "0% 0% 100% 0%" };
		default:
			return { viewportMargin: "0% 0% 0% 0%" };
	}
}

module.exports = function (flags, contextData, userData) {
	const gptUnitName = getGPTUnitName(contextData);
	const targeting = extend({
		pt: pageType.toLowerCase().substr(0, 3),
		nlayout: utils.getLayoutName()
	}, metadata.user(true));

	const kruxConfig = (flags.get('krux')) && {
		id: 'KHUSeE3x',
		attributes: {
			user: metadata.user(),
			page: {
				unitName: gptUnitName
			}
		}
	};

	const buildObjectFromArray = (targetObject) =>
	targetObject
		.reduce((prev, data) => {
			prev[data.key] = data.value;
			return prev;
		}, {});

	const contextDataObject = {
		dfp: contextData && contextData.dfp && contextData.dfp.targeting ? buildObjectFromArray(contextData.dfp.targeting) : {},
		krux: contextData && contextData.krux && contextData.krux.attributes ? buildObjectFromArray(contextData.krux.attributes) : {}
	};

	const userDataObject = {
		dfp: userData && userData.dfp && userData.dfp.targeting ? buildObjectFromArray(userData.dfp.targeting) : {},
		krux: userData && userData.krux && userData.krux.attributes ? buildObjectFromArray(userData.krux.attributes) : {}
	};

	extend(targeting, contextDataObject.dfp, userDataObject.dfp);

	if(kruxConfig) {
		extend(kruxConfig.attributes.page, contextDataObject.krux);
		extend(kruxConfig.attributes.user, userDataObject.krux);
	}


	return {
		gpt: {
			unitName:	gptUnitName
		},
		formats: {
			PaidPost: {
				sizes: "fluid"
			}
		},
		krux: kruxConfig,
		collapseEmpty: 'before',
		dfp_targeting: utils.keyValueString(targeting),
		lazyLoad: getLazyLoadConfig(flags)
	};

};
