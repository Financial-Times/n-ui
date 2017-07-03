module.exports = {
	demo: {
		'./public/main-without-n-ui.js': './demo/client/main.js',
		'./public/n-ui/font-loader.js': './browser/bundles/font-loader.js',
		'./public/n-ui/o-errors.js': './browser/bundles/o-errors.js',
		'./public/main.css': './demo/client/main.scss'
	},
	deploy: {
		'./public/n-ui/es5.js': './browser/bundles/main.js',
		'./public/n-ui/es5.js': './browser/bundles/main.js',
		'./public/n-ui/font-loader.js': './browser/bundles/font-loader.js',
		'./public/n-ui/o-errors.js': './browser/bundles/o-errors.js',
		'./public/n-ui/n-ui-core.css': './browser/bundles/shared-head.scss'
	},
	appDefault: {
		'./public/main.css': './client/main.scss'
	},
	appJs: {
		'./public/main-without-n-ui.js': './client/main.js'
	},
	appShell: {
		'./public/n-ui/es5.js': './bower_components/n-ui/build/deploy/wrapper.js',
		'./public/n-ui/font-loader.js': './browser/bundles/font-loader.js',
		'./public/n-ui/o-errors.js': './browser/bundles/o-errors.js'
	}
}
