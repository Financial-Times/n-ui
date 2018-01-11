const log = require('@financial-times/n-logger').default;

const NavigationModelV2 = require('./navigationModelV2');

let navigationModelV2;

module.exports = {
	init: options => {
		navigationModelV2 = new NavigationModelV2(options);

		return navigationModelV2.init();
	},
	middleware : (req, res, next) => {
		log.debug({event:'NAVIGATION_MIDDLEWARE', source:'Origami'});
		return navigationModelV2.middleware(req, res, next);
	}
};
