const webpack = require('webpack');

module.exports = {
	optimization: {
		namedModules: true
	},

	plugins: [
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new (require('rewiremock/webpack/plugin'))()
	]
};
