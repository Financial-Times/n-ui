const NavigationModelV2 = require('./navigationModelV2');

let navigationModelV2;

const init = options => {
	navigationModelV2 = new NavigationModelV2(options);
	return navigationModelV2.init();
};

const middleware = (req, res, next) =>
	navigationModelV2.middleware(req, res, next);

module.exports = {
	init,
	middleware
};
