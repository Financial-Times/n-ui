const nWebpack = require('@financial-times/n-webpack');

module.exports = options => {
	return nWebpack(Object.assign({}, {
		withHeadCss: true,
		withHashedAssets: true
	}, options), true);
}
