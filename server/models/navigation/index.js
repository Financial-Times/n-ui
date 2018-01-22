const NavigationModelV2 = require('./navigationModelV2');

let navigationModelV2;

module.exports = {
	init: options => {
		navigationModelV2 = new NavigationModelV2(options);

		return navigationModelV2.init();
	},
	middleware : (req, res, next) => {
		return navigationModelV2.middleware(req, res, next);
	}
};
