const nWebpack = require('../build/deploy/webpack.deploy.config.js');
const webpackConfig = nWebpack();

webpackConfig.entry = {
	'./public/main-without-n-ui.js': './demo/client/main.js',
	'./public/main.css': './demo/client/main.scss'
}

module.exports = webpackConfig;
